import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { TransactionStatus } from '../../domain/entities';
import {
  ProductRepositoryPort,
  PRODUCT_REPOSITORY_PORT,
  TransactionRepositoryPort,
  TRANSACTION_REPOSITORY_PORT,
  IntegrityServicePort,
  INTEGRITY_SERVICE_PORT,
} from '../../domain/ports';
import { Result, success, failure, AppError } from '../../domain/value-objects';

export interface CreateTransactionInput {
  productId: string;
  quantity: number;
  customerEmail: string;
  baseFee: number;
  deliveryFee: number;
}

export interface CreateTransactionOutput {
  transactionId: string;
  reference: string;
  totalAmount: number;
  signature: string;
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepo: ProductRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepo: TransactionRepositoryPort,
    @Inject(INTEGRITY_SERVICE_PORT)
    private readonly integrityService: IntegrityServicePort,
  ) {}

  async execute(
    input: CreateTransactionInput,
  ): Promise<Result<CreateTransactionOutput, AppError>> {
    // Step 1: Validate input
    if (!input.productId || !input.customerEmail || input.quantity < 1) {
      return failure(
        AppError.validation('Invalid input: productId, customerEmail required, quantity >= 1'),
      );
    }

    // Step 2: Check product exists
    const product = await this.productRepo.findById(input.productId);
    if (!product) {
      return failure(AppError.notFound('Product not found'));
    }

    // Step 3: Check stock available
    if (!product.hasStock(input.quantity)) {
      return failure(AppError.insufficientStock());
    }

    // Step 4: Check duplicate transaction
    const reference = `txn_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const existing = await this.transactionRepo.findByReference(reference);
    if (existing) {
      return success({
        transactionId: existing.id,
        reference: existing.reference,
        totalAmount: existing.totalAmount,
        signature: this.integrityService.generateSignature(
          existing.reference,
          Math.round(existing.totalAmount * 100),
          'COP',
        ),
      });
    }

    // Step 5: Compute total
    const totalAmount =
      Math.round((product.price * input.quantity + input.baseFee + input.deliveryFee) * 100) / 100;

    // Step 6: Persist transaction
    const transaction = await this.transactionRepo.create({
      reference,
      productId: input.productId,
      quantity: input.quantity,
      totalAmount,
      baseFee: input.baseFee,
      deliveryFee: input.deliveryFee,
      status: TransactionStatus.PENDING,
      customerEmail: input.customerEmail,
    });

    // Step 7: Generate signature
    const amountInCents = Math.round(totalAmount * 100);
    const signature = this.integrityService.generateSignature(
      transaction.reference,
      amountInCents,
      'COP',
    );

    return success({
      transactionId: transaction.id,
      reference: transaction.reference,
      totalAmount: transaction.totalAmount,
      signature,
    });
  }
}
