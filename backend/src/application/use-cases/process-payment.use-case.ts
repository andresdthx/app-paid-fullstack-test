import { Inject, Injectable } from '@nestjs/common';
import { TransactionStatus } from '../../domain/entities';
import {
  TransactionRepositoryPort,
  TRANSACTION_REPOSITORY_PORT,
  ProductRepositoryPort,
  PRODUCT_REPOSITORY_PORT,
  CustomerRepositoryPort,
  CUSTOMER_REPOSITORY_PORT,
  DeliveryRepositoryPort,
  DELIVERY_REPOSITORY_PORT,
  PaymentGatewayPort,
  PAYMENT_GATEWAY_PORT,
  IntegrityServicePort,
  INTEGRITY_SERVICE_PORT,
} from '../../domain/ports';
import {
  Result,
  success,
  failure,
  isFailure,
  AppError,
} from '../../domain/value-objects';

export interface ProcessPaymentInput {
  transactionId: string;
  cardToken: string;
  acceptanceToken: string;
  customerEmail: string;
  deliveryData: {
    fullName: string;
    streetAddress: string;
    city: string;
    department: string;
    postalCode: string;
  };
}

export interface ProcessPaymentOutput {
  transactionId: string;
  reference: string;
  status: TransactionStatus;
  statusReason?: string;
}

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepo: TransactionRepositoryPort,
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepo: ProductRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY_PORT)
    private readonly customerRepo: CustomerRepositoryPort,
    @Inject(DELIVERY_REPOSITORY_PORT)
    private readonly deliveryRepo: DeliveryRepositoryPort,
    @Inject(PAYMENT_GATEWAY_PORT)
    private readonly paymentGateway: PaymentGatewayPort,
    @Inject(INTEGRITY_SERVICE_PORT)
    private readonly integrityService: IntegrityServicePort,
  ) {}

  async execute(
    input: ProcessPaymentInput,
  ): Promise<Result<ProcessPaymentOutput, AppError>> {
    // Step 1: Find transaction
    const transaction = await this.transactionRepo.findById(input.transactionId);
    if (!transaction) {
      return failure(AppError.notFound('Transaction not found'));
    }

    if (!transaction.isPending()) {
      return failure(
        AppError.conflict('Transaction is not in PENDING status'),
      );
    }

    // Step 2: Create payment in gateway
    const amountInCents = Math.round(transaction.totalAmount * 100);
    const signature = this.integrityService.generateSignature(
      transaction.reference,
      amountInCents,
      'COP',
    );

    const paymentResult = await this.paymentGateway.createPayment({
      acceptanceToken: input.acceptanceToken,
      amountInCents,
      currency: 'COP',
      customerEmail: input.customerEmail,
      reference: transaction.reference,
      paymentMethodToken: input.cardToken,
      signature,
    });

    if (isFailure(paymentResult)) {
      await this.transactionRepo.updateStatus(
        transaction.id,
        TransactionStatus.ERROR,
        paymentResult.error.message,
      );
      return failure(paymentResult.error);
    }

    // Step 3: Poll status (gateway may return PENDING initially)
    const gatewayStatus = paymentResult.value;
    let finalStatus: TransactionStatus;
    let statusReason: string | undefined;

    if (gatewayStatus.status === 'APPROVED') {
      finalStatus = TransactionStatus.APPROVED;
    } else if (
      gatewayStatus.status === 'DECLINED' ||
      gatewayStatus.status === 'VOIDED'
    ) {
      finalStatus = TransactionStatus.DECLINED;
      statusReason = gatewayStatus.status;
    } else {
      // Poll for final status
      const pollResult = await this.pollTransactionStatus(gatewayStatus.id);
      if (isFailure(pollResult)) {
        await this.transactionRepo.updateStatus(
          transaction.id,
          TransactionStatus.ERROR,
          pollResult.error.message,
        );
        return failure(pollResult.error);
      }
      finalStatus = pollResult.value.status;
      statusReason = pollResult.value.reason;
    }

    // Step 4: Validate integrity
    const integrityValid = this.integrityService.validateSignature(
      transaction.reference,
      amountInCents,
      'COP',
      signature,
    );

    if (!integrityValid) {
      return failure(
        AppError.integrity('Payment integrity verification failed'),
      );
    }

    // Step 5: Update transaction status
    await this.transactionRepo.updateStatus(
      transaction.id,
      finalStatus,
      statusReason,
      gatewayStatus.id,
    );

    // Step 6: Handle approval
    if (finalStatus === TransactionStatus.APPROVED) {
      const stockResult = await this.productRepo.decrementStock(
        transaction.productId,
        transaction.quantity,
      );
      if (isFailure(stockResult)) {
        await this.transactionRepo.updateStatus(
          transaction.id,
          TransactionStatus.ERROR,
          'Product no longer available',
        );
        return failure(stockResult.error);
      }

      // Create/update customer
      let customer = await this.customerRepo.findByEmail(input.customerEmail);
      if (!customer) {
        customer = await this.customerRepo.create({
          name: input.deliveryData.fullName,
          email: input.customerEmail,
        });
      }

      // Create delivery record
      await this.deliveryRepo.create({
        transactionId: transaction.id,
        customerId: customer.id,
        productId: transaction.productId,
        fullName: input.deliveryData.fullName,
        streetAddress: input.deliveryData.streetAddress,
        city: input.deliveryData.city,
        department: input.deliveryData.department,
        postalCode: input.deliveryData.postalCode,
      });
    }

    return success({
      transactionId: transaction.id,
      reference: transaction.reference,
      status: finalStatus,
      statusReason,
    });
  }

  private async pollTransactionStatus(
    gatewayTransactionId: string,
    maxAttempts = 12,
    intervalMs = 5000,
  ): Promise<Result<{ status: TransactionStatus; reason?: string }, AppError>> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await this.delay(intervalMs);

      const result = await this.paymentGateway.getTransactionStatus(gatewayTransactionId);
      if (isFailure(result)) {
        continue;
      }

      const { status } = result.value;
      if (status === 'APPROVED') {
        return success({ status: TransactionStatus.APPROVED });
      }
      if (status === 'DECLINED' || status === 'VOIDED') {
        return success({
          status: TransactionStatus.DECLINED,
          reason: status,
        });
      }
      if (status === 'ERROR') {
        return success({
          status: TransactionStatus.ERROR,
          reason: 'Gateway error',
        });
      }
    }

    return failure(
      AppError.externalService('Payment gateway timeout - max polling attempts reached'),
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
