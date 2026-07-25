import { IntegrityService } from './integrity.service';
import { createHash } from 'crypto';

describe('IntegrityService', () => {
  const integrityKey = 'test_integrity_key_123';
  let service: IntegrityService;

  beforeEach(() => {
    service = new IntegrityService(integrityKey);
  });

  describe('generateSignature', () => {
    it('should generate a SHA-256 hash of reference+amount+currency+key', () => {
      const reference = 'txn_abc123';
      const amountInCents = 50000;
      const currency = 'COP';

      const expected = createHash('sha256')
        .update(`${reference}${amountInCents}${currency}${integrityKey}`)
        .digest('hex');

      const result = service.generateSignature(reference, amountInCents, currency);
      expect(result).toBe(expected);
    });

    it('should produce different hashes for different references', () => {
      const sig1 = service.generateSignature('ref1', 1000, 'COP');
      const sig2 = service.generateSignature('ref2', 1000, 'COP');
      expect(sig1).not.toBe(sig2);
    });

    it('should produce different hashes for different amounts', () => {
      const sig1 = service.generateSignature('ref', 1000, 'COP');
      const sig2 = service.generateSignature('ref', 2000, 'COP');
      expect(sig1).not.toBe(sig2);
    });
  });

  describe('validateSignature', () => {
    it('should return true for a valid signature', () => {
      const reference = 'txn_valid';
      const amount = 75000;
      const currency = 'COP';
      const signature = service.generateSignature(reference, amount, currency);

      expect(service.validateSignature(reference, amount, currency, signature)).toBe(true);
    });

    it('should return false for an invalid signature', () => {
      expect(service.validateSignature('ref', 1000, 'COP', 'invalid_hash')).toBe(false);
    });

    it('should return false when reference differs', () => {
      const signature = service.generateSignature('ref1', 1000, 'COP');
      expect(service.validateSignature('ref2', 1000, 'COP', signature)).toBe(false);
    });

    it('should return false when amount differs', () => {
      const signature = service.generateSignature('ref', 1000, 'COP');
      expect(service.validateSignature('ref', 2000, 'COP', signature)).toBe(false);
    });

    it('should return false for empty signature', () => {
      expect(service.validateSignature('ref', 1000, 'COP', '')).toBe(false);
    });
  });
});
