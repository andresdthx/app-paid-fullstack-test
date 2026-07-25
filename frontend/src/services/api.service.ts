import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface CreateTransactionRequest {
  productId: string;
  quantity: number;
  customerEmail: string;
  baseFee: number;
  deliveryFee: number;
}

export interface TransactionResponse {
  transactionId: string;
  reference: string;
  totalAmount: number;
  signature: string;
}

export interface ProcessPaymentRequest {
  cardToken: string;
  acceptanceToken: string;
  customerEmail: string;
  deliveryData: {
    fullName: string;
    streetAddress: string;
    city: string;
    department: string;
    postalCode: string;
  };
}

export interface PaymentResultResponse {
  transactionId: string;
  reference: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  statusReason?: string;
}

export const apiService = {
  async getProducts(): Promise<ProductResponse[]> {
    const response = await api.get('/products');
    return response.data;
  },

  async createTransaction(data: CreateTransactionRequest): Promise<TransactionResponse> {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  async getTransaction(id: string): Promise<any> {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async processPayment(transactionId: string, data: ProcessPaymentRequest): Promise<PaymentResultResponse> {
    const response = await api.post(`/transactions/${transactionId}/process`, data);
    return response.data;
  },
};

export default apiService;
