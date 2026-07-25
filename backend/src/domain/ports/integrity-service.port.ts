export interface IntegrityServicePort {
  generateSignature(reference: string, amountInCents: number, currency: string): string;
  validateSignature(reference: string, amountInCents: number, currency: string, signature: string): boolean;
}

export const INTEGRITY_SERVICE_PORT = Symbol('IntegrityServicePort');
