import { useState } from 'react';
import {
  luhnCheck,
  detectCardBrand,
  validateExpiry,
  validateCVV,
  validateCardholderName,
} from '../../utils/card-validation';
import type { CardFormData } from '../../store/slices/checkout.slice';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardData: CardFormData) => void;
}

function PaymentModal({ isOpen, onClose, onSubmit }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const brand = detectCardBrand(cardNumber);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const digits = cardNumber.replace(/\D/g, '');

    if (digits.length < 13 || digits.length > 19) {
      newErrors.cardNumber = 'Card number must be 13-19 digits';
    } else if (!luhnCheck(digits)) {
      newErrors.cardNumber = 'Invalid card number (failed Luhn check)';
    }

    if (!validateCardholderName(cardholderName)) {
      newErrors.cardholderName = 'Name must be at least 2 alphabetic characters';
    }

    if (!validateExpiry(expiryMonth, expiryYear)) {
      newErrors.expiry = 'Invalid or expired date';
    }

    if (!validateCVV(cvv)) {
      newErrors.cvv = 'CVV must be 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        cardNumber: cardNumber.replace(/\D/g, ''),
        cardholderName,
        expiryMonth,
        expiryYear,
        cvv,
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Payment information">
        <header className="modal__header">
          <h2>Payment Information</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">&times;</button>
        </header>

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cardNumber">Card Number</label>
            <div className="input-with-icon">
              <input
                id="cardNumber"
                type="text"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, ''))}
                placeholder="4111 1111 1111 1111"
                inputMode="numeric"
              />
              {brand !== 'unknown' && (
                <span className={`card-brand card-brand--${brand}`}>
                  {brand === 'visa' ? 'VISA' : 'MC'}
                </span>
              )}
            </div>
            {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cardholderName">Cardholder Name</label>
            <input
              id="cardholderName"
              type="text"
              maxLength={50}
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="John Doe"
            />
            {errors.cardholderName && <span className="error">{errors.cardholderName}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiryMonth">Expiry (MM/YY)</label>
              <div className="expiry-inputs">
                <input
                  id="expiryMonth"
                  type="text"
                  maxLength={2}
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, ''))}
                  placeholder="MM"
                  inputMode="numeric"
                />
                <span>/</span>
                <input
                  type="text"
                  maxLength={2}
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, ''))}
                  placeholder="YY"
                  inputMode="numeric"
                />
              </div>
              {errors.expiry && <span className="error">{errors.expiry}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                id="cvv"
                type="text"
                maxLength={3}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                inputMode="numeric"
              />
              {errors.cvv && <span className="error">{errors.cvv}</span>}
            </div>
          </div>

          <button type="submit" className="modal__submit">
            Continue to Delivery
          </button>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;
