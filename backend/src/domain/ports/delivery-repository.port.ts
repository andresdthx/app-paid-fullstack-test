import { Delivery } from '../entities';

export interface DeliveryRepositoryPort {
  create(delivery: Omit<Delivery, 'id' | 'createdAt'>): Promise<Delivery>;
  findByTransactionId(transactionId: string): Promise<Delivery | null>;
  findById(id: string): Promise<Delivery | null>;
}

export const DELIVERY_REPOSITORY_PORT = Symbol('DeliveryRepositoryPort');
