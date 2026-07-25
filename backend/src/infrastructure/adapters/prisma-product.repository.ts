import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities';
import { ProductRepositoryPort } from '../../domain/ports';
import { Result, success, failure, AppError } from '../../domain/value-objects';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const records = await this.prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async decrementStock(id: string, quantity: number): Promise<Result<Product, AppError>> {
    try {
      const updated = await this.prisma.product.update({
        where: { id, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      return success(this.toDomain(updated));
    } catch {
      return failure(AppError.insufficientStock());
    }
  }

  private toDomain(record: any): Product {
    return new Product({
      id: record.id,
      name: record.name,
      description: record.description,
      price: Number(record.price),
      stock: record.stock,
      imageUrl: record.imageUrl,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
