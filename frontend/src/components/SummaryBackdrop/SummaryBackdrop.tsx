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
  retryCount?: number;
  onPay: () => void;
  onCancel?: () => void;
}

function SummaryBackdrop({
  productName,
  productPrice,
  quantity,
  baseFee,
  deliveryFee,
  loading,
  error,
  retryCount = 0,
  onPay,
  onCancel,
}: SummaryBackdropProps) {
  const productAmount = productPrice * quantity;
  const total = calculateTotal(productPrice, quantity, baseFee, deliveryFee);
  const maxRetriesReached = retryCount >= 3;

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

        {error && (
          <div className="backdrop__error-container" role="alert" aria-live="assertive">
            <p className="backdrop__error">{error}</p>
            {!maxRetriesReached && (
              <p className="backdrop__retry-hint">
                Attempt {retryCount}/3 — Click below to retry
              </p>
            )}
          </div>
        )}

        <div className="backdrop__actions">
          <button
            className="backdrop__pay-button"
            onClick={onPay}
            disabled={loading || maxRetriesReached}
          >
            {loading ? 'Processing...' : error ? 'Retry Payment' : 'Confirm Payment'}
          </button>

          {onCancel && (
            <button className="backdrop__cancel-button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          )}
        </div>

        <div className="backdrop__security-badge">
          <span className="backdrop__lock-icon">&#128274;</span>
          <span className="backdrop__security-text">
            Secure payment — Card data encrypted via TLS
          </span>
        </div>
      </div>
    </div>
  );
}

export default SummaryBackdrop;
