import { Result } from '../value-objects';
import { AppError } from '../value-objects';

export interface CardTokenInput {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export interface CardToken {
  id: string;
  brand: string;
  lastFour: string;
}

export interface GatewayTransactionStatus {
  id: string;
  status: string;
  reference: string;
  amountInCents: number;
  currency: string;
}

export interface CreatePaymentInput {
  acceptanceToken: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  reference: string;
  paymentMethodToken: string;
  signature: string;
}

export interface PaymentGatewayPort {
  tokenizeCard(cardData: CardTokenInput): Promise<Result<CardToken, AppError>>;
  getAcceptanceToken(): Promise<Result<string, AppError>>;
  createPayment(input: CreatePaymentInput): Promise<Result<GatewayTransactionStatus, AppError>>;
  getTransactionStatus(transactionId: string): Promise<Result<GatewayTransactionStatus, AppError>>;
}

export const PAYMENT_GATEWAY_PORT = Symbol('PaymentGatewayPort');
