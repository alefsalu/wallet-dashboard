import { describe, it, expect, vi } from 'vitest';
import { createSingleFlightRefresh } from './api-client';

describe('createSingleFlightRefresh', () => {
  it('dispatches exactly 1 refresh call when 5 requests 401 concurrently', async () => {
    const refreshFn = vi.fn().mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 10));
      return 'new-access-token';
    });
    const singleFlight = createSingleFlightRefresh(refreshFn);

    const results = await Promise.all([
      singleFlight(),
      singleFlight(),
      singleFlight(),
      singleFlight(),
      singleFlight(),
    ]);

    expect(refreshFn).toHaveBeenCalledTimes(1);
    expect(results).toEqual(Array(5).fill('new-access-token'));
  });

  it('allows a new refresh call after the first finishes', async () => {
    const refreshFn = vi.fn().mockResolvedValue('token-1');
    const singleFlight = createSingleFlightRefresh(refreshFn);

    const first = await singleFlight();
    expect(first).toBe('token-1');
    expect(refreshFn).toHaveBeenCalledTimes(1);

    refreshFn.mockResolvedValueOnce('token-2');
    const second = await singleFlight();
    expect(second).toBe('token-2');
    expect(refreshFn).toHaveBeenCalledTimes(2);
  });

  it('resets mutex if refresh call fails', async () => {
    const refreshFn = vi.fn().mockRejectedValue(new Error('Refresh failed'));
    const singleFlight = createSingleFlightRefresh(refreshFn);

    await expect(singleFlight()).rejects.toThrow('Refresh failed');

    refreshFn.mockResolvedValueOnce('recovered-token');
    const recovered = await singleFlight();
    expect(recovered).toBe('recovered-token');
  });
});
