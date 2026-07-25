import { Injectable, HttpException } from '@nestjs/common';
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
        }),
      );
      const data = response.data.data;
      return success({
        id: data.id,
        brand: data.brand,
        lastFour: data.last_four,
      });
    } catch (error) {
      return failure(AppError.externalService('Card tokenization failed'));
    }
  }

  async getAcceptanceToken(): Promise<Result<string, AppError>> {
    try {
      const response = await firstValueFrom(
        this.httpClient.get(`${this.apiUrl}/merchants/${this.publicKey}`),
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
            timeout: 30000,
          },
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
      return failure(AppError.externalService('Payment creation failed'));
    }
  }

  async getTransactionStatus(transactionId: string): Promise<Result<GatewayTransactionStatus, AppError>> {
    try {
      const response = await firstValueFrom(
        this.httpClient.get(`${this.apiUrl}/transactions/${transactionId}`, {
          headers: { Authorization: `Bearer ${this.publicKey}` },
          timeout: 30000,
        }),
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
}
