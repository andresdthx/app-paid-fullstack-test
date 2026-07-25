import { Transaction, TransactionStatus } from '../entities';

export interface CreateTransactionData {
  reference: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  baseFee: number;
  deliveryFee: number;
  status: TransactionStatus;
  customerEmail: string;
  gatewayTransactionId?: string;
  statusReason?: string;
}

export interface TransactionRepositoryPort {
  create(data: CreateTransactionData): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByReference(reference: string): Promise<Transaction | null>;
  updateStatus(
    id: string,
    status: TransactionStatus,
    reason?: string,
    gatewayId?: string,
  ): Promise<Transaction>;
}

export const TRANSACTION_REPOSITORY_PORT = Symbol('TransactionRepositoryPort');
