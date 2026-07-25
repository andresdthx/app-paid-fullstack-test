import { Transaction, TransactionStatus } from '../entities';

export interface TransactionRepositoryPort {
  create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction>;
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
