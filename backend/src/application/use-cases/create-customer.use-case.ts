import { Inject, Injectable } from '@nestjs/common';
import { Customer } from '../../domain/entities';
import {
  CustomerRepositoryPort,
  CUSTOMER_REPOSITORY_PORT,
} from '../../domain/ports';
import { Result, success, failure, AppError } from '../../domain/value-objects';

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
  documentId?: string;
}

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_PORT)
    private readonly customerRepo: CustomerRepositoryPort,
  ) {}

  async execute(input: CreateCustomerInput): Promise<Result<Customer, AppError>> {
    // Step 1: Validate input
    if (!input.name || !input.email) {
      return failure(AppError.validation('Name and email are required'));
    }

    // Step 2: Check existing customer (idempotent - return existing)
    const existing = await this.customerRepo.findByEmail(input.email);
    if (existing) {
      const updated = await this.customerRepo.update(existing.id, {
        name: input.name,
        phone: input.phone,
        documentId: input.documentId,
      });
      return success(updated);
    }

    // Step 3: Create customer
    try {
      const customer = await this.customerRepo.create({
        name: input.name,
        email: input.email,
        phone: input.phone,
        documentId: input.documentId,
      });
      return success(customer);
    } catch (error) {
      return failure(
        AppError.internal('Failed to create customer', String(error)),
      );
    }
  }
}
