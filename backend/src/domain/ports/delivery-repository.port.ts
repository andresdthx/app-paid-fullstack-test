import { Delivery } from '../entities';

export interface CreateDeliveryData {
  transactionId: string;
  customerId: string;
  productId: string;
  fullName: string;
  streetAddress: string;
  city: string;
  department: string;
  postalCode: string;
}

export interface DeliveryRepositoryPort {
  create(data: CreateDeliveryData): Promise<Delivery>;
  findByTransactionId(transactionId: string): Promise<Delivery | null>;
  findById(id: string): Promise<Delivery | null>;
}

export const DELIVERY_REPOSITORY_PORT = Symbol('DeliveryRepositoryPort');
