import { formatCOP, calculateTotal } from '../../utils/amount-calculation';
import './SummaryBackdrop.css';

interface SummaryBackdropProps {
  productName: string;
  productPrice: number;
  quantity: number;
  baseFee: number;
  deliveryFee: number;
  loading: boolean;
  error?: string | null;
  onPay: () => void;
}

function SummaryBackdrop({
  productName,
  productPrice,
  quantity,
  baseFee,
  deliveryFee,
  loading,
  error,
  onPay,
}: SummaryBackdropProps) {
  const productAmount = productPrice * quantity;
  const total = calculateTotal(productPrice, quantity, baseFee, deliveryFee);
  const isDisabled = loading || !!error;

  return (
    <div className="backdrop-overlay">
      <div className="backdrop" role="dialog" aria-label="Payment summary">
        <h2 className="backdrop__title">Payment Summary</h2>

        <div className="backdrop__items">
          <div className="backdrop__item">
            <span className="backdrop__label">{productName} x{quantity}</span>
            <span className="backdrop__value">{formatCOP(productAmount)}</span>
          </div>
          <div className="backdrop__item">
            <span className="backdrop__label">Base Fee</span>
            <span className="backdrop__value">{formatCOP(baseFee)}</span>
          </div>
          <div className="backdrop__item">
            <span className="backdrop__label">Delivery Fee</span>
            <span className="backdrop__value">{formatCOP(deliveryFee)}</span>
          </div>
          <div className="backdrop__item backdrop__item--total">
            <span>Total</span>
            <span>{formatCOP(total)}</span>
          </div>
        </div>

        {error && <p className="backdrop__error">{error}</p>}

        <button
          className="backdrop__pay-button"
          onClick={onPay}
          disabled={isDisabled}
        >
          {loading ? 'Processing...' : 'Confirm Payment'}
        </button>
      </div>
    </div>
  );
}

export default SummaryBackdrop;
