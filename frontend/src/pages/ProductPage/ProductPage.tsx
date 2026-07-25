import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { setProducts, setLoading, setError } from '../../store/slices/products.slice';
import {
  setStep,
  selectProduct,
  setCardData,
  setDeliveryData,
  setTransaction,
  setLoading as setCheckoutLoading,
  setError as setCheckoutError,
  clearSensitiveData,
  resetCheckout,
  incrementRetry,
} from '../../store/slices/checkout.slice';
import type { CardFormData, DeliveryFormData } from '../../store/slices/checkout.slice';
import ProductCard from '../../components/ProductCard/ProductCard';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import DeliveryForm from '../../components/DeliveryForm/DeliveryForm';
import SummaryBackdrop from '../../components/SummaryBackdrop/SummaryBackdrop';
import apiService from '../../services/api.service';
import payGatewayService from '../../services/pay-gateway.service';
import persistenceService from '../../services/persistence.service';
import { useNavigate } from 'react-router-dom';
import './ProductPage.css';

function ProductPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items: products, loading, error } = useSelector((s: RootState) => s.products);
  const checkout = useSelector((s: RootState) => s.checkout);
  const [modalOpen, setModalOpen] = useState(false);

  const selectedProduct = products.find((p) => p.id === checkout.selectedProductId);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (checkout.step !== 'product') {
      persistenceService.save(checkout);
    }
  }, [checkout.step, checkout.deliveryData]);

  const fetchProducts = async () => {
    dispatch(setLoading(true));
    try {
      const data = await apiService.getProducts();
      dispatch(setProducts(data));
    } catch {
      dispatch(setError('Failed to load products. Please try again.'));
    }
  };

  const handleBuy = (productId: string) => {
    dispatch(selectProduct({ productId, quantity: 1 }));
    dispatch(setStep('card'));
    setModalOpen(true);
  };

  const handleCardSubmit = (cardData: CardFormData) => {
    dispatch(setCardData(cardData));
    dispatch(setStep('delivery'));
    setModalOpen(false);
  };

  const handleDeliverySubmit = (data: DeliveryFormData) => {
    dispatch(setDeliveryData(data));
    dispatch(setStep('summary'));
  };

  const handlePay = async () => {
    if (!selectedProduct || !checkout.cardData || !checkout.deliveryData) return;

    dispatch(setCheckoutLoading(true));
    dispatch(setCheckoutError(null));

    try {
      // 1. Create transaction
      const txn = await apiService.createTransaction({
        productId: selectedProduct.id,
        quantity: checkout.quantity,
        customerEmail: 'customer@test.com',
        baseFee: checkout.fees.baseFee,
        deliveryFee: checkout.fees.deliveryFee,
      });

      // 2. Tokenize card
      const token = await payGatewayService.tokenizeCard({
        number: checkout.cardData.cardNumber,
        cvc: checkout.cardData.cvv,
        exp_month: checkout.cardData.expiryMonth,
        exp_year: checkout.cardData.expiryYear,
        card_holder: checkout.cardData.cardholderName,
      });

      // 3. Get acceptance token
      const acceptanceToken = await payGatewayService.getAcceptanceToken();

      // 4. Process payment
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
    } catch (err: any) {
      const retries = checkout.retryCount;
      if (retries < 3) {
        dispatch(incrementRetry());
        dispatch(setCheckoutError('Payment failed. Please try again.'));
      } else {
        dispatch(setCheckoutError('Maximum retries reached. Returning to products.'));
        setTimeout(() => {
          dispatch(resetCheckout());
          persistenceService.clear();
        }, 3000);
      }
    } finally {
      dispatch(setCheckoutLoading(false));
    }
  };

  const handleBack = () => {
    dispatch(resetCheckout());
    persistenceService.clear();
  };

  // Render based on step
  if (checkout.step === 'delivery') {
    return (
      <div className="page-container">
        <button className="back-button" onClick={handleBack}>← Back to Products</button>
        <DeliveryForm onSubmit={handleDeliverySubmit} initialData={checkout.deliveryData} />
      </div>
    );
  }

  if (checkout.step === 'summary' && selectedProduct) {
    return (
      <div className="page-container">
        <SummaryBackdrop
          productName={selectedProduct.name}
          productPrice={selectedProduct.price}
          quantity={checkout.quantity}
          baseFee={checkout.fees.baseFee}
          deliveryFee={checkout.fees.deliveryFee}
          loading={checkout.loading}
          error={checkout.error}
          onPay={handlePay}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Our Products</h1>
      </header>

      {loading && <div className="loading-spinner" role="status">Loading...</div>}
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={fetchProducts}>Retry</button>
        </div>
      )}

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.price}
            stock={product.stock}
            imageUrl={product.imageUrl}
            onBuy={handleBuy}
          />
        ))}
      </div>

      <PaymentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); dispatch(resetCheckout()); }}
        onSubmit={handleCardSubmit}
      />
    </div>
  );
}

export default ProductPage;
