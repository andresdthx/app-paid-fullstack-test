import { Injectable } from '@nestjs/common';
import { Delivery } from '../../domain/entities';
import { DeliveryRepositoryPort, CreateDeliveryData } from '../../domain/ports';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDeliveryData): Promise<Delivery> {
    const record = await this.prisma.delivery.create({ data });
    return this.toDomain(record);
  }

  async findByTransactionId(transactionId: string): Promise<Delivery | null> {
    const record = await this.prisma.delivery.findUnique({
      where: { transactionId },
    });
    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<Delivery | null> {
    const record = await this.prisma.delivery.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  private toDomain(record: any): Delivery {
    return new Delivery({
      id: record.id,
      transactionId: record.transactionId,
      customerId: record.customerId,
      productId: record.productId,
      fullName: record.fullName,
      streetAddress: record.streetAddress,
      city: record.city,
      department: record.department,
      postalCode: record.postalCode,
      createdAt: record.createdAt,
    });
  }
}
