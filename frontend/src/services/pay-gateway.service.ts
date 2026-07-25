import axios from 'axios';
import { withRetry } from '../utils/retry';

const gatewayUrl = import.meta.env.VITE_GATEWAY_API_URL || '';
const publicKey = import.meta.env.VITE_GATEWAY_PUBLIC_KEY || '';

export interface TokenizeCardInput {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

export interface TokenResponse {
  id: string;
  brand: string;
  last_four: string;
}

export const payGatewayService = {
  async tokenizeCard(cardData: TokenizeCardInput): Promise<TokenResponse> {
    return withRetry(
      async () => {
        const response = await axios.post(
          `${gatewayUrl}/tokens/cards`,
          cardData,
          {
            headers: {
              Authorization: `Bearer ${publicKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          },
        );
        return response.data.data;
      },
      { maxAttempts: 2, baseDelayMs: 500 },
    );
  },

  async getAcceptanceToken(): Promise<string> {
    return withRetry(
      async () => {
        const response = await axios.get(`${gatewayUrl}/merchants/${publicKey}`, {
          timeout: 10000,
        });
        return response.data.data.presigned_acceptance.acceptance_token;
      },
      { maxAttempts: 3, baseDelayMs: 1000 },
    );
  },
};

export default payGatewayService;
