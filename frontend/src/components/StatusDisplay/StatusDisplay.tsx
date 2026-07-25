import { formatCOP } from '../../utils/amount-calculation';
import './StatusDisplay.css';

interface StatusDisplayProps {
  status: 'APPROVED' | 'DECLINED' | 'ERROR';
  transactionId: string;
  reference: string;
  productName?: string;
  totalAmount?: number;
  createdAt?: string;
  statusReason?: string;
  onReturn: () => void;
}

function StatusDisplay({
  status,
  transactionId,
  reference,
  productName,
  totalAmount,
  createdAt,
  statusReason,
  onReturn,
}: StatusDisplayProps) {
  const isSuccess = status === 'APPROVED';

  return (
    <div className="status-display">
      <div className={`status-display__icon ${isSuccess ? 'status-display__icon--success' : 'status-display__icon--error'}`}>
        {isSuccess ? '\u2713' : '\u2717'}
      </div>

      <h1 className="status-display__title">
        {isSuccess ? 'Payment Successful' : 'Payment Failed'}
      </h1>

      <div className="status-display__details">
        <div className="status-display__detail">
          <span className="status-display__detail-label">Transaction</span>
          <span className="status-display__detail-value">{reference}</span>
        </div>
        {productName && (
          <div className="status-display__detail">
            <span className="status-display__detail-label">Product</span>
            <span className="status-display__detail-value">{productName}</span>
          </div>
        )}
        {totalAmount !== undefined && (
          <div className="status-display__detail">
            <span className="status-display__detail-label">Total</span>
            <span className="status-display__detail-value">{formatCOP(totalAmount)}</span>
          </div>
        )}
        {createdAt && (
          <div className="status-display__detail">
            <span className="status-display__detail-label">Date</span>
            <span className="status-display__detail-value">
              {new Date(createdAt).toLocaleDateString('es-CO')}
            </span>
          </div>
        )}
      </div>

      {statusReason && (
        <p className="status-display__reason">Reason: {statusReason}</p>
      )}

      <button className="status-display__button" onClick={onReturn}>
        Return to Products
      </button>
    </div>
  );
}

export default StatusDisplay;
