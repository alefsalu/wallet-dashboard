import { describe, it, expect } from 'vitest';
import { parseProblemDetails, isProblemDetails } from './rfc7807';

describe('parseProblemDetails', () => {
  it('parses RFC 7807 problem json with field-level errors', () => {
    const raw = {
      type: 'https://api.wallet.local/errors/validation',
      title: 'Validation Error',
      status: 400,
      detail: 'Invalid payload',
      instance: '/api/v1/wallets/me/deposits',
      code: 'VALIDATION_ERROR',
      errors: [{ field: 'amount', message: 'Must be greater than 0' }],
    };
    const parsed = parseProblemDetails(raw);
    expect(parsed.code).toBe('VALIDATION_ERROR');
    expect(parsed.status).toBe(400);
    expect(parsed.title).toBe('Validation Error');
    expect(parsed.detail).toBe('Invalid payload');
    expect(parsed.errors?.[0].field).toBe('amount');
    expect(isProblemDetails(raw)).toBe(true);
  });

  it('provides safe fallbacks for unexpected or partial error structures', () => {
    const parsed = parseProblemDetails({ message: 'Something went wrong' });
    expect(parsed.title).toBe('Error');
    expect(parsed.detail).toBe('Something went wrong');
    expect(parsed.status).toBe(500);
    expect(parsed.code).toBe('INTERNAL_ERROR');

    const empty = parseProblemDetails(null);
    expect(empty.title).toBe('Error');
    expect(empty.status).toBe(500);
  });
});
