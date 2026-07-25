import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities';
import {
  ProductRepositoryPort,
  PRODUCT_REPOSITORY_PORT,
} from '../../domain/ports';
import { Result, success, failure, AppError } from '../../domain/value-objects';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepo: ProductRepositoryPort,
  ) {}

  async execute(): Promise<Result<Product[], AppError>> {
    try {
      const products = await this.productRepo.findAll();
      return success(products);
    } catch (error) {
      return failure(
        AppError.internal('Failed to retrieve products', String(error)),
      );
    }
  }
}
