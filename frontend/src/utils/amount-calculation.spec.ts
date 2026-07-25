import { calculateTotal, toCents, formatCOP } from './amount-calculation';

describe('amount-calculation', () => {
  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      expect(calculateTotal(50000, 1, 5000, 10000)).toBe(65000);
    });

    it('should handle multiple quantities', () => {
      expect(calculateTotal(10000, 3, 5000, 10000)).toBe(45000);
    });

    it('should handle zero fees', () => {
      expect(calculateTotal(25000, 2, 0, 0)).toBe(50000);
    });

    it('should round to 2 decimal places', () => {
      const result = calculateTotal(33.33, 3, 0, 0);
      expect(result).toBe(99.99);
    });
  });

  describe('toCents', () => {
    it('should convert COP to cents', () => {
      expect(toCents(50000)).toBe(5000000);
    });

    it('should handle decimals', () => {
      expect(toCents(100.50)).toBe(10050);
    });

    it('should round properly', () => {
      expect(toCents(99.999)).toBe(10000);
    });
  });

  describe('formatCOP', () => {
    it('should format with COP currency', () => {
      const result = formatCOP(50000);
      expect(result).toContain('50');
      expect(result).toContain('000');
    });

    it('should include 2 decimal places', () => {
      const result = formatCOP(100);
      expect(result).toMatch(/\d+[.,]\d{2}/);
    });
  });
});
