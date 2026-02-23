const currencyFormatter = new Intl.NumberFormat('es-UY', {
  style: 'currency',
  currency: 'UYU',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatUYU(amount: number): string {
  return currencyFormatter.format(amount);
}
