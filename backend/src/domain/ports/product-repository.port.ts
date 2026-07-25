import { Product } from '../entities';
import { Result } from '../value-objects';
import { AppError } from '../value-objects';

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  decrementStock(id: string, quantity: number): Promise<Result<Product, AppError>>;
}

export const PRODUCT_REPOSITORY_PORT = Symbol('ProductRepositoryPort');
