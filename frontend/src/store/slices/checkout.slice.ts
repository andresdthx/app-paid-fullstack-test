import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CheckoutStep = 'product' | 'card' | 'delivery' | 'summary' | 'status';

export interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface DeliveryFormData {
  fullName: string;
  streetAddress: string;
  city: string;
  department: string;
  postalCode: string;
}

export interface TransactionResult {
  id: string;
  reference: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  totalAmount: number;
  statusReason?: string;
  createdAt: string;
}

export interface CheckoutState {
  step: CheckoutStep;
  selectedProductId: string | null;
  quantity: number;
  cardData: CardFormData | null;
  deliveryData: DeliveryFormData | null;
  fees: {
    baseFee: number;
    deliveryFee: number;
  };
  transaction: TransactionResult | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
}

const initialState: CheckoutState = {
  step: 'product',
  selectedProductId: null,
  quantity: 1,
  cardData: null,
  deliveryData: null,
  fees: {
    baseFee: 5000,
    deliveryFee: 10000,
  },
  transaction: null,
  loading: false,
  error: null,
  retryCount: 0,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload;
    },
    selectProduct(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      state.selectedProductId = action.payload.productId;
      state.quantity = action.payload.quantity;
    },
    setCardData(state, action: PayloadAction<CardFormData>) {
      state.cardData = action.payload;
    },
    setDeliveryData(state, action: PayloadAction<DeliveryFormData>) {
      state.deliveryData = action.payload;
    },
    setTransaction(state, action: PayloadAction<TransactionResult>) {
      state.transaction = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    incrementRetry(state) {
      state.retryCount += 1;
    },
    clearSensitiveData(state) {
      state.cardData = null;
    },
    resetCheckout() {
      return initialState;
    },
  },
});

export const {
  setStep,
  selectProduct,
  setCardData,
  setDeliveryData,
  setTransaction,
  setLoading,
  setError,
  incrementRetry,
  clearSensitiveData,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
