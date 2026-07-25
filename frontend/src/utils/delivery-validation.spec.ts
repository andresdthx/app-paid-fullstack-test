import { validatePostalCode, validateRequiredField } from './delivery-validation';

describe('delivery-validation', () => {
  describe('validatePostalCode', () => {
    it('should return true for exactly 6 digits', () => {
      expect(validatePostalCode('110111')).toBe(true);
    });

    it('should return true for 6 digits with leading/trailing spaces', () => {
      expect(validatePostalCode(' 110111 ')).toBe(true);
    });

    it('should return false for less than 6 digits', () => {
      expect(validatePostalCode('12345')).toBe(false);
    });

    it('should return false for more than 6 digits', () => {
      expect(validatePostalCode('1234567')).toBe(false);
    });

    it('should return false for non-numeric', () => {
      expect(validatePostalCode('abc123')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validatePostalCode('')).toBe(false);
    });
  });

  describe('validateRequiredField', () => {
    it('should return true for valid non-empty string', () => {
      expect(validateRequiredField('Hello', 100)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(validateRequiredField('', 100)).toBe(false);
    });

    it('should return false for whitespace-only string', () => {
      expect(validateRequiredField('   ', 100)).toBe(false);
    });

    it('should return false when exceeding maxLength', () => {
      expect(validateRequiredField('a'.repeat(101), 100)).toBe(false);
    });

    it('should return true at exactly maxLength', () => {
      expect(validateRequiredField('a'.repeat(100), 100)).toBe(true);
    });
  });
});
