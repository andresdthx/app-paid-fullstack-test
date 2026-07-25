export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}

export function detectCardBrand(cardNumber: string): 'visa' | 'mastercard' | 'unknown' {
  const digits = cardNumber.replace(/\D/g, '');
  if (!digits) return 'unknown';

  if (digits.startsWith('4')) return 'visa';

  const twoDigit = parseInt(digits.slice(0, 2), 10);
  if (twoDigit >= 51 && twoDigit <= 55) return 'mastercard';

  const fourDigit = parseInt(digits.slice(0, 4), 10);
  if (fourDigit >= 2221 && fourDigit <= 2720) return 'mastercard';

  return 'unknown';
}

export function validateExpiry(month: string, year: string): boolean {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (isNaN(m) || isNaN(y)) return false;
  if (m < 1 || m > 12) return false;

  const fullYear = y < 100 ? 2000 + y : y;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (fullYear < currentYear) return false;
  if (fullYear === currentYear && m < currentMonth) return false;

  return true;
}

export function validateCVV(cvv: string): boolean {
  return /^\d{3}$/.test(cvv);
}

export function validateCardholderName(name: string): boolean {
  if (name.length < 2) return false;
  return /^[A-Za-z\s\-]+$/.test(name);
}
