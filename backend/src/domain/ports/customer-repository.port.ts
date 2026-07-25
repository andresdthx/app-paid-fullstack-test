import { Customer } from '../entities';

export interface CustomerRepositoryPort {
  findByEmail(email: string): Promise<Customer | null>;
  findById(id: string): Promise<Customer | null>;
  create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer>;
  update(id: string, data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Customer>;
}

export const CUSTOMER_REPOSITORY_PORT = Symbol('CustomerRepositoryPort');
