import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  PaymentGatewayPort,
  CardTokenInput,
  CardToken,
  GatewayTransactionStatus,
  CreatePaymentInput,
} from '../../domain/ports';
import { Result, success, failure, AppError } from '../../domain/value-objects';
import { firstValueFrom } from 'rxjs';
import { timeout, retry } from 'rxjs/operators';

const TIMEOUT_MS = 30000;
const RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1000;

@Injectable()
export class PayGatewayAdapter implements PaymentGatewayPort {
  private readonly apiUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;

  constructor(private readonly httpClient: HttpService) {
    this.apiUrl = process.env.PAYMENT_GATEWAY_API_URL || '';
    this.publicKey = process.env.PAYMENT_GATEWAY_PUBLIC_KEY || '';
    this.privateKey = process.env.PAYMENT_GATEWAY_PRIVATE_KEY || '';
  }

  async tokenizeCard(cardData: CardTokenInput): Promise<Result<CardToken, AppError>> {
    try {
      const response = await firstValueFrom(
        this.httpClient.post(`${this.apiUrl}/tokens/cards`, cardData, {
          headers: { Authorization: `Bearer ${this.publicKey}` },
          timeout: TIMEOUT_MS,
        }).pipe(
          timeout(TIMEOUT_MS),
          retry({ count: RETRY_ATTEMPTS, delay: RETRY_DELAY_MS }),
        ),
      );
      const data = response.data.data;
      return success({
        id: data.id,
        brand: data.brand,
        lastFour: data.last_four,
      });
    } catch (error) {
      const message = this.extractErrorMessage(error, 'Card tokenization failed');
      return failure(AppError.externalService(message));
    }
  }

  async getAcceptanceToken(): Promise<Result<string, AppError>> {
    try {
      const response = await firstValueFrom(
        this.httpClient.get(`${this.apiUrl}/merchants/${this.publicKey}`, {
          timeout: TIMEOUT_MS,
        }).pipe(
          timeout(TIMEOUT_MS),
          retry({ count: RETRY_ATTEMPTS, delay: RETRY_DELAY_MS }),
        ),
      );
      return success(response.data.data.presigned_acceptance.acceptance_token);
    } catch (error) {
      return failure(AppError.externalService('Failed to get acceptance token'));
    }
  }

  async createPayment(input: CreatePaymentInput): Promise<Result<GatewayTransactionStatus, AppError>> {
    try {
      const response = await firstValueFrom(
        this.httpClient.post(
          `${this.apiUrl}/transactions`,
          {
            acceptance_token: input.acceptanceToken,
            amount_in_cents: input.amountInCents,
            currency: input.currency,
            customer_email: input.customerEmail,
            reference: input.reference,
            payment_method: {
              type: 'CARD',
              token: input.paymentMethodToken,
              installments: 1,
            },
            signature: input.signature,
          },
          {
            headers: { Authorization: `Bearer ${this.privateKey}` },
            timeout: TIMEOUT_MS,
          },
        ).pipe(timeout(TIMEOUT_MS)),
        // No retry on payment creation to avoid double-charging
      );
      const data = response.data.data;
      return success({
        id: data.id,
        status: data.status,
        reference: data.reference,
        amountInCents: data.amount_in_cents,
        currency: data.currency,
      });
    } catch (error) {
      const message = this.extractErrorMessage(error, 'Payment creation failed');
      return failure(AppError.externalService(message));
    }
  }

  async getTransactionStatus(transactionId: string): Promise<Result<GatewayTransactionStatus, AppError>> {
    try {
      const response = await firstValueFrom(
        this.httpClient.get(`${this.apiUrl}/transactions/${transactionId}`, {
          headers: { Authorization: `Bearer ${this.publicKey}` },
          timeout: TIMEOUT_MS,
        }).pipe(
          timeout(TIMEOUT_MS),
          retry({ count: RETRY_ATTEMPTS, delay: RETRY_DELAY_MS }),
        ),
      );
      const data = response.data.data;
      return success({
        id: data.id,
        status: data.status,
        reference: data.reference,
        amountInCents: data.amount_in_cents,
        currency: data.currency,
      });
    } catch (error) {
      return failure(AppError.externalService('Failed to get transaction status'));
    }
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as any).response;
      if (response?.data?.error?.messages) {
        const messages = response.data.error.messages;
        return Object.values(messages).flat().join('; ') || fallback;
      }
      if (response?.data?.message) {
        return response.data.message;
      }
    }
    return fallback;
  }
}
