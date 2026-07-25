import { Inject, Injectable } from '@nestjs/common';
import { Delivery } from '../../domain/entities';
import {
  DeliveryRepositoryPort,
  DELIVERY_REPOSITORY_PORT,
  TransactionRepositoryPort,
  TRANSACTION_REPOSITORY_PORT,
} from '../../domain/ports';
import { Result, success, failure, AppError } from '../../domain/value-objects';

export interface CreateDeliveryInput {
  transactionId: string;
  customerId: string;
  productId: string;
  fullName: string;
  streetAddress: string;
  city: string;
  department: string;
  postalCode: string;
}

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY_PORT)
    private readonly deliveryRepo: DeliveryRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepo: TransactionRepositoryPort,
  ) {}

  async execute(input: CreateDeliveryInput): Promise<Result<Delivery, AppError>> {
    // Step 1: Validate input
    if (
      !input.transactionId ||
      !input.customerId ||
      !input.productId ||
      !input.fullName ||
      !input.streetAddress ||
      !input.city ||
      !input.department ||
      !input.postalCode
    ) {
      return failure(AppError.validation('All delivery fields are required'));
    }

    if (!/^\d{6}$/.test(input.postalCode)) {
      return failure(AppError.validation('Postal code must be exactly 6 digits'));
    }

    // Step 2: Check transaction exists
    const transaction = await this.transactionRepo.findById(input.transactionId);
    if (!transaction) {
      return failure(AppError.notFound('Transaction not found'));
    }

    // Step 3: Check idempotency (no duplicate delivery for same transaction)
    const existingDelivery = await this.deliveryRepo.findByTransactionId(
      input.transactionId,
    );
    if (existingDelivery) {
      return success(existingDelivery);
    }

    // Step 4: Create delivery
    try {
      const delivery = await this.deliveryRepo.create({
        transactionId: input.transactionId,
        customerId: input.customerId,
        productId: input.productId,
        fullName: input.fullName,
        streetAddress: input.streetAddress,
        city: input.city,
        department: input.department,
        postalCode: input.postalCode,
      });
      return success(delivery);
    } catch (error) {
      return failure(
        AppError.internal('Failed to create delivery record', String(error)),
      );
    }
  }
}
