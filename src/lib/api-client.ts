import createClient from 'openapi-fetch';
import type { paths } from '@/types/api';
import { getCorrelationId } from './correlation-id';
import { tokenStorage } from './auth-token-storage';

export function createSingleFlightRefresh<T = string>(
  refreshFn: () => Promise<T>
): () => Promise<T> {
  let inFlightPromise: Promise<T> | null = null;

  return function execute(): Promise<T> {
    if (inFlightPromise) {
      return inFlightPromise;
    }

    inFlightPromise = (async () => {
      try {
        const result = await refreshFn();
        return result;
      } finally {
        inFlightPromise = null;
      }
    })();

    return inFlightPromise;
  };
}

type AuthExpiredListener = () => void;
const authExpiredListeners = new Set<AuthExpiredListener>();

export function onAuthExpired(listener: AuthExpiredListener): () => void {
  authExpiredListeners.add(listener);
  return () => {
    authExpiredListeners.delete(listener);
  };
}

function notifyAuthExpired(): void {
  for (const listener of authExpiredListeners) {
    try {
      listener();
    } catch (e) {
      console.error('Error in auth expired listener:', e);
    }
  }
}

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api/v1';

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
});

async function performTokenRefresh(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    tokenStorage.clear();
    notifyAuthExpired();
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-Id': getCorrelationId(),
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    tokenStorage.clear();
    notifyAuthExpired();
    throw new Error(`Token refresh failed with status ${response.status}`);
  }

  const data = (await response.json()) as { accessToken: string; refreshToken?: string };
  tokenStorage.setAccessToken(data.accessToken);
  if (data.refreshToken) {
    tokenStorage.setRefreshToken(data.refreshToken);
  }
  return data.accessToken;
}

export const singleFlightRefreshToken = createSingleFlightRefresh(performTokenRefresh);

apiClient.use({
  onRequest({ request }) {
    if (!request.headers.has('X-Correlation-Id')) {
      request.headers.set('X-Correlation-Id', getCorrelationId());
    }

    const accessToken = tokenStorage.getAccessToken();
    if (accessToken && !request.headers.has('Authorization')) {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return request;
  },

  async onResponse({ request, response }) {
    if (response.status === 401) {
      const url = new URL(request.url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      const isAuthEndpoint =
        url.pathname.endsWith('/auth/login') ||
        url.pathname.endsWith('/auth/register') ||
        url.pathname.endsWith('/auth/refresh') ||
        url.pathname.endsWith('/auth/logout');

      if (isAuthEndpoint) {
        return response;
      }

      try {
        const newAccessToken = await singleFlightRefreshToken();
        // Clone request with new authorization header and retry
        const retryHeaders = new Headers(request.headers);
        retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
        retryHeaders.set('X-Correlation-Id', getCorrelationId());

        const retryRequest = new Request(request.url, {
          method: request.method,
          headers: retryHeaders,
          body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.clone().blob() : undefined,
          credentials: request.credentials,
        });

        return fetch(retryRequest);
      } catch (_err) {
        return response;
      }
    }

    return response;
  },
});
