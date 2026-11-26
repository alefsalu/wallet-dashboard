export function formatBRL(amount: string | number): string {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount || '0');
  const safeNumber = isNaN(numericAmount) ? 0 : numericAmount;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeNumber);
}
