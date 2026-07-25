import { createHash, timingSafeEqual } from 'crypto';
import { IntegrityServicePort } from '../ports';

export class IntegrityService implements IntegrityServicePort {
  constructor(private readonly integrityKey: string) {}

  generateSignature(reference: string, amountInCents: number, currency: string): string {
    const payload = `${reference}${amountInCents}${currency}${this.integrityKey}`;
    return createHash('sha256').update(payload).digest('hex');
  }

  validateSignature(
    reference: string,
    amountInCents: number,
    currency: string,
    signature: string,
  ): boolean {
    const expected = this.generateSignature(reference, amountInCents, currency);

    if (expected.length !== signature.length) {
      return false;
    }

    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}
