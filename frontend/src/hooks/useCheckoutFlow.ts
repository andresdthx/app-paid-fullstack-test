import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import {
  setStep,
  selectProduct,
  setCardData,
  setDeliveryData,
  setTransaction,
  setLoading,
  setError,
  clearSensitiveData,
  resetCheckout,
  incrementRetry,
} from '../store/slices/checkout.slice';
import type { CardFormData, DeliveryFormData } from '../store/slices/checkout.slice';
import apiService from '../services/api.service';
import payGatewayService from '../services/pay-gateway.service';
import persistenceService from '../services/persistence.service';

const MAX_RETRIES = 3;

export function useCheckoutFlow() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const checkout = useSelector((s: RootState) => s.checkout);
  const products = useSelector((s: RootState) => s.products.items);
  const selectedProduct = products.find((p) => p.id === checkout.selectedProductId);

  const startCheckout = useCallback((productId: string) => {
    dispatch(selectProduct({ productId, quantity: 1 }));
    dispatch(setStep('card'));
  }, [dispatch]);

  const submitCard = useCallback((cardData: CardFormData) => {
    dispatch(setCardData(cardData));
    dispatch(setStep('delivery'));
  }, [dispatch]);

  const submitDelivery = useCallback((data: DeliveryFormData) => {
    dispatch(setDeliveryData(data));
    dispatch(setStep('summary'));
    persistenceService.save({ ...checkout, deliveryData: data, step: 'summary' });
  }, [dispatch, checkout]);

  const processPayment = useCallback(async () => {
    if (!selectedProduct || !checkout.cardData || !checkout.deliveryData) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const txn = await apiService.createTransaction({
        productId: selectedProduct.id,
        quantity: checkout.quantity,
        customerEmail: 'customer@test.com',
        baseFee: checkout.fees.baseFee,
        deliveryFee: checkout.fees.deliveryFee,
      });

      const token = await payGatewayService.tokenizeCard({
        number: checkout.cardData.cardNumber,
        cvc: checkout.cardData.cvv,
        exp_month: checkout.cardData.expiryMonth,
        exp_year: checkout.cardData.expiryYear,
        card_holder: checkout.cardData.cardholderName,
      });

      const acceptanceToken = await payGatewayService.getAcceptanceToken();

      const result = await apiService.processPayment(txn.transactionId, {
        cardToken: token.id,
        acceptanceToken,
        customerEmail: 'customer@test.com',
        deliveryData: checkout.deliveryData,
      });

      dispatch(setTransaction({
        id: result.transactionId,
        reference: result.reference,
        status: result.status,
        totalAmount: txn.totalAmount,
        statusReason: result.statusReason,
        createdAt: new Date().toISOString(),
      }));
      dispatch(clearSensitiveData());
      dispatch(setStep('status'));
      persistenceService.clear();
      navigate(`/status/${result.transactionId}`);
    } catch {
      if (checkout.retryCount < MAX_RETRIES) {
        dispatch(incrementRetry());
        dispatch(setError('Payment failed. Please try again.'));
      } else {
        dispatch(setError('Maximum retries reached. Returning to products.'));
        setTimeout(() => {
          dispatch(resetCheckout());
          persistenceService.clear();
        }, 3000);
      }
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, navigate, selectedProduct, checkout]);

  const reset = useCallback(() => {
    dispatch(resetCheckout());
    persistenceService.clear();
  }, [dispatch]);

  return {
    checkout,
    selectedProduct,
    startCheckout,
    submitCard,
    submitDelivery,
    processPayment,
    reset,
  };
}
