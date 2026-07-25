import { Customer } from '../entities';

export interface CreateCustomerData {
  name: string;
  email: string;
  phone?: string;
  documentId?: string;
}

export interface CustomerRepositoryPort {
  findByEmail(email: string): Promise<Customer | null>;
  findById(id: string): Promise<Customer | null>;
  create(data: CreateCustomerData): Promise<Customer>;
  update(id: string, data: Partial<CreateCustomerData>): Promise<Customer>;
}

export const CUSTOMER_REPOSITORY_PORT = Symbol('CustomerRepositoryPort');
