import { describe, it, expect } from 'vitest';
import { moneyAmountSchema } from './money-schema';

describe('moneyAmountSchema', () => {
  it('accepts valid amounts up to 1000000.00 with 2 decimals', () => {
    expect(moneyAmountSchema.safeParse('10.00').success).toBe(true);
    expect(moneyAmountSchema.safeParse('1000000.00').success).toBe(true);
    expect(moneyAmountSchema.safeParse('50').success).toBe(true);
    expect(moneyAmountSchema.safeParse('0.50').success).toBe(true);
  });

  it('rejects 0, negative values, 3 decimals, or values exceeding 1000000.00', () => {
    expect(moneyAmountSchema.safeParse('0.00').success).toBe(false);
    expect(moneyAmountSchema.safeParse('0').success).toBe(false);
    expect(moneyAmountSchema.safeParse('-10.00').success).toBe(false);
    expect(moneyAmountSchema.safeParse('10.555').success).toBe(false);
    expect(moneyAmountSchema.safeParse('1000000.01').success).toBe(false);
    expect(moneyAmountSchema.safeParse('abc').success).toBe(false);
  });
});
