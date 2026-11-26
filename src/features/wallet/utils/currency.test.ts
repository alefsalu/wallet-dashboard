import { describe, it, expect } from 'vitest';
import { formatBRL } from './currency';

describe('formatBRL', () => {
  it('formats decimal string "1000.50" into Brazilian Real currency string', () => {
    const formatted = formatBRL('1000.50');
    expect(formatted).toMatch(/R\$\s?1\.000,50/);
  });

  it('formats numbers or edge values gracefully', () => {
    expect(formatBRL('0.00')).toMatch(/R\$\s?0,00/);
    expect(formatBRL(2500)).toMatch(/R\$\s?2\.500,00/);
  });
});
