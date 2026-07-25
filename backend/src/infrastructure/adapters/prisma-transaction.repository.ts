import { Injectable } from '@nestjs/common';
import { Transaction, TransactionStatus } from '../../domain/entities';
import { TransactionRepositoryPort, CreateTransactionData } from '../../domain/ports';
import { PrismaService } from '../config/prisma.service';
import { TransactionStatus as PrismaStatus } from '@prisma/client';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTransactionData): Promise<Transaction> {
    const record = await this.prisma.transaction.create({
      data: {
        reference: data.reference,
        productId: data.productId,
        quantity: data.quantity,
        totalAmount: data.totalAmount,
        baseFee: data.baseFee,
        deliveryFee: data.deliveryFee,
        status: data.status as unknown as PrismaStatus,
        customerEmail: data.customerEmail,
        gatewayTransactionId: data.gatewayTransactionId,
        statusReason: data.statusReason,
      },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<Transaction | null> {
    const record = await this.prisma.transaction.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByReference(reference: string): Promise<Transaction | null> {
    const record = await this.prisma.transaction.findUnique({ where: { reference } });
    return record ? this.toDomain(record) : null;
  }

  async updateStatus(
    id: string,
    status: TransactionStatus,
    reason?: string,
    gatewayId?: string,
  ): Promise<Transaction> {
    const record = await this.prisma.transaction.update({
      where: { id },
      data: {
        status: status as unknown as PrismaStatus,
        statusReason: reason,
        gatewayTransactionId: gatewayId,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: any): Transaction {
    return new Transaction({
      id: record.id,
      reference: record.reference,
      productId: record.productId,
      quantity: record.quantity,
      totalAmount: Number(record.totalAmount),
      baseFee: Number(record.baseFee),
      deliveryFee: Number(record.deliveryFee),
      status: record.status as TransactionStatus,
      customerEmail: record.customerEmail,
      gatewayTransactionId: record.gatewayTransactionId ?? undefined,
      statusReason: record.statusReason ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
