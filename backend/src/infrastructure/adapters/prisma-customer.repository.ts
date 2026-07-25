import { Injectable } from '@nestjs/common';
import { Customer } from '../../domain/entities';
import { CustomerRepositoryPort, CreateCustomerData } from '../../domain/ports';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async create(data: CreateCustomerData): Promise<Customer> {
    const record = await this.prisma.customer.create({ data });
    return this.toDomain(record);
  }

  async update(id: string, data: Partial<CreateCustomerData>): Promise<Customer> {
    const record = await this.prisma.customer.update({
      where: { id },
      data,
    });
    return this.toDomain(record);
  }

  private toDomain(record: any): Customer {
    return new Customer({
      id: record.id,
      name: record.name,
      email: record.email,
      phone: record.phone ?? undefined,
      documentId: record.documentId ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
