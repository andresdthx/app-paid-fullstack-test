import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCheckoutFlow } from '../../hooks/useCheckoutFlow';
import ProductCard from '../../components/ProductCard/ProductCard';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import DeliveryForm from '../../components/DeliveryForm/DeliveryForm';
import SummaryBackdrop from '../../components/SummaryBackdrop/SummaryBackdrop';
import './ProductPage.css';

function ProductPage() {
  const { products, loading, error, refetch } = useProducts();
  const {
    checkout,
    selectedProduct,
    startCheckout,
    submitCard,
    submitDelivery,
    processPayment,
    reset,
  } = useCheckoutFlow();
  const [modalOpen, setModalOpen] = useState(false);

  const handleBuy = (productId: string) => {
    startCheckout(productId);
    setModalOpen(true);
  };

  // Step: Delivery Form
  if (checkout.step === 'delivery') {
    return (
      <div className="page-container">
        <button className="back-button" onClick={reset} aria-label="Back to products">
          &larr; Back to Products
        </button>
        <DeliveryForm onSubmit={submitDelivery} initialData={checkout.deliveryData} />
      </div>
    );
  }

  // Step: Summary Backdrop
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
          onPay={processPayment}
        />
      </div>
    );
  }

  // Step: Product List (default)
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Our Products</h1>
      </header>

      {loading && (
        <div className="loading-spinner" role="status" aria-live="polite">
          Loading products...
        </div>
      )}

      {error && (
        <div className="error-banner" role="alert" aria-live="assertive">
          <p>{error}</p>
          <button onClick={refetch}>Retry</button>
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
        onClose={() => { setModalOpen(false); reset(); }}
        onSubmit={(cardData) => { submitCard(cardData); setModalOpen(false); }}
      />
    </div>
  );
}

export default ProductPage;
