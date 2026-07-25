import checkoutReducer, {
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
} from './checkout.slice';

describe('checkout slice', () => {
  const initialState = checkoutReducer(undefined, { type: 'unknown' });

  it('should return initial state', () => {
    expect(initialState.step).toBe('product');
    expect(initialState.selectedProductId).toBeNull();
    expect(initialState.quantity).toBe(1);
    expect(initialState.cardData).toBeNull();
    expect(initialState.deliveryData).toBeNull();
    expect(initialState.transaction).toBeNull();
    expect(initialState.loading).toBe(false);
    expect(initialState.error).toBeNull();
    expect(initialState.retryCount).toBe(0);
  });

  it('should handle setStep', () => {
    const state = checkoutReducer(initialState, setStep('card'));
    expect(state.step).toBe('card');
  });

  it('should handle selectProduct', () => {
    const state = checkoutReducer(initialState, selectProduct({ productId: 'p-1', quantity: 2 }));
    expect(state.selectedProductId).toBe('p-1');
    expect(state.quantity).toBe(2);
  });

  it('should handle setCardData', () => {
    const cardData = { cardNumber: '4111', cardholderName: 'John', expiryMonth: '12', expiryYear: '30', cvv: '123' };
    const state = checkoutReducer(initialState, setCardData(cardData));
    expect(state.cardData).toEqual(cardData);
  });

  it('should handle setDeliveryData', () => {
    const delivery = { fullName: 'John', streetAddress: 'St', city: 'C', department: 'D', postalCode: '110111' };
    const state = checkoutReducer(initialState, setDeliveryData(delivery));
    expect(state.deliveryData).toEqual(delivery);
  });

  it('should handle setTransaction', () => {
    const txn = { id: 't-1', reference: 'ref', status: 'APPROVED' as const, totalAmount: 100, createdAt: '2024-01-01' };
    const state = checkoutReducer(initialState, setTransaction(txn));
    expect(state.transaction).toEqual(txn);
  });

  it('should handle setLoading', () => {
    const state = checkoutReducer(initialState, setLoading(true));
    expect(state.loading).toBe(true);
  });

  it('should handle setError', () => {
    const state = checkoutReducer(initialState, setError('Payment failed'));
    expect(state.error).toBe('Payment failed');
  });

  it('should handle incrementRetry', () => {
    let state = checkoutReducer(initialState, incrementRetry());
    expect(state.retryCount).toBe(1);
    state = checkoutReducer(state, incrementRetry());
    expect(state.retryCount).toBe(2);
  });

  it('should handle clearSensitiveData', () => {
    const stateWithCard = checkoutReducer(initialState, setCardData({
      cardNumber: '4111', cardholderName: 'J', expiryMonth: '12', expiryYear: '30', cvv: '123',
    }));
    const cleared = checkoutReducer(stateWithCard, clearSensitiveData());
    expect(cleared.cardData).toBeNull();
  });

  it('should handle resetCheckout', () => {
    let state = checkoutReducer(initialState, setStep('summary'));
    state = checkoutReducer(state, setLoading(true));
    state = checkoutReducer(state, resetCheckout());
    expect(state).toEqual(initialState);
  });
});
