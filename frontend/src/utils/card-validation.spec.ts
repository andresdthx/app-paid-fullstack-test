import { luhnCheck, detectCardBrand, validateExpiry, validateCVV, validateCardholderName } from './card-validation';

describe('card-validation', () => {
  describe('luhnCheck', () => {
    it('should return true for valid Visa number', () => {
      expect(luhnCheck('4111111111111111')).toBe(true);
    });

    it('should return true for valid MasterCard number', () => {
      expect(luhnCheck('5500000000000004')).toBe(true);
    });

    it('should return false for invalid number', () => {
      expect(luhnCheck('1234567890123456')).toBe(false);
    });

    it('should return false for too short number', () => {
      expect(luhnCheck('411111')).toBe(false);
    });

    it('should return false for too long number', () => {
      expect(luhnCheck('41111111111111111111')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(luhnCheck('')).toBe(false);
    });

    it('should handle numbers with spaces', () => {
      expect(luhnCheck('4111 1111 1111 1111')).toBe(true);
    });
  });

  describe('detectCardBrand', () => {
    it('should detect Visa (starts with 4)', () => {
      expect(detectCardBrand('4111111111111111')).toBe('visa');
    });

    it('should detect MasterCard (starts with 51-55)', () => {
      expect(detectCardBrand('5500000000000004')).toBe('mastercard');
      expect(detectCardBrand('5100000000000000')).toBe('mastercard');
    });

    it('should detect MasterCard (starts with 2221-2720)', () => {
      expect(detectCardBrand('2221000000000000')).toBe('mastercard');
      expect(detectCardBrand('2720000000000000')).toBe('mastercard');
    });

    it('should return unknown for other prefixes', () => {
      expect(detectCardBrand('6011000000000000')).toBe('unknown');
      expect(detectCardBrand('3700000000000000')).toBe('unknown');
    });

    it('should return unknown for empty string', () => {
      expect(detectCardBrand('')).toBe('unknown');
    });
  });

  describe('validateExpiry', () => {
    it('should return true for future date', () => {
      expect(validateExpiry('12', '30')).toBe(true);
    });

    it('should return false for past date', () => {
      expect(validateExpiry('01', '20')).toBe(false);
    });

    it('should return false for invalid month', () => {
      expect(validateExpiry('13', '30')).toBe(false);
      expect(validateExpiry('00', '30')).toBe(false);
    });

    it('should return false for NaN input', () => {
      expect(validateExpiry('ab', 'cd')).toBe(false);
    });
  });

  describe('validateCVV', () => {
    it('should return true for 3 digits', () => {
      expect(validateCVV('123')).toBe(true);
    });

    it('should return false for 2 digits', () => {
      expect(validateCVV('12')).toBe(false);
    });

    it('should return false for non-numeric', () => {
      expect(validateCVV('abc')).toBe(false);
    });
  });

  describe('validateCardholderName', () => {
    it('should return true for valid name', () => {
      expect(validateCardholderName('John Doe')).toBe(true);
    });

    it('should return true for hyphenated name', () => {
      expect(validateCardholderName('Mary-Jane Watson')).toBe(true);
    });

    it('should return false for single character', () => {
      expect(validateCardholderName('J')).toBe(false);
    });

    it('should return false for numbers in name', () => {
      expect(validateCardholderName('John123')).toBe(false);
    });

    it('should return false for special characters', () => {
      expect(validateCardholderName('John@Doe')).toBe(false);
    });
  });
});
