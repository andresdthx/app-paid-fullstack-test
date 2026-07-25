export function calculateTotal(
  productPrice: number,
  quantity: number,
  baseFee: number,
  deliveryFee: number,
): number {
  return Math.round((productPrice * quantity + baseFee + deliveryFee) * 100) / 100;
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
