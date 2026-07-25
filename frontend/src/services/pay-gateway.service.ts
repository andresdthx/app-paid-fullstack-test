import axios from 'axios';

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
    const response = await axios.post(
      `${gatewayUrl}/tokens/cards`,
      cardData,
      {
        headers: {
          Authorization: `Bearer ${publicKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.data;
  },

  async getAcceptanceToken(): Promise<string> {
    const response = await axios.get(`${gatewayUrl}/merchants/${publicKey}`);
    return response.data.data.presigned_acceptance.acceptance_token;
  },
};

export default payGatewayService;
