import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './server';
import { apiClient } from '../lib/api-client';
import { tokenStorage } from '../lib/auth-token-storage';

beforeAll(() => {
  tokenStorage.setAccessToken('mock-access-token');
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => server.resetHandlers());
afterAll(() => {
  server.close();
  tokenStorage.clear();
});

describe('MSW Contract Handlers', () => {
  it('GET /wallets/me returns wallet fixture with BRL balance', async () => {
    const { data, response } = await apiClient.GET('/wallets/me');
    expect(response.status).toBe(200);
    expect(data?.balance).toEqual({ amount: '1000.00', currency: 'BRL' });
  });

  it('POST /wallets/me/deposits replays response on duplicate Idempotency-Key', async () => {
    const key = '11111111-1111-1111-1111-111111111111';
    const first = await apiClient.POST('/wallets/me/deposits', {
      headers: { 'Idempotency-Key': key },
      body: { amount: '50.00' },
    });
    expect(first.response.status).toBe(201);

    const second = await apiClient.POST('/wallets/me/deposits', {
      headers: { 'Idempotency-Key': key },
      body: { amount: '50.00' },
    });
    expect(second.response.status).toBe(201);
    expect(second.response.headers.get('Idempotent-Replayed')).toBe('true');
  });
});
