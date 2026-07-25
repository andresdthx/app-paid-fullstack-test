export function validatePostalCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

export function validateRequiredField(value: string, maxLength: number): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength;
}
