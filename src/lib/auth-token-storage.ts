let inMemoryAccessToken: string | null = null;
const REFRESH_TOKEN_KEY = 'wallet_refresh_token';

export const tokenStorage = {
  getAccessToken(): string | null {
    return inMemoryAccessToken;
  },

  setAccessToken(token: string | null): void {
    inMemoryAccessToken = token;
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string | null): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    if (token) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  clear(): void {
    inMemoryAccessToken = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
};
