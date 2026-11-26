import { apiClient, singleFlightRefreshToken } from '@/lib/api-client';
import { tokenStorage } from '@/lib/auth-token-storage';
import { parseProblemDetails } from '@/lib/rfc7807';
import type { LoginInput, RegisterInput, AuthUser } from '../types';

export async function loginApi(credentials: LoginInput): Promise<{ user: AuthUser; accessToken: string }> {
  const { data, error } = await apiClient.POST('/auth/login', {
    body: credentials,
  });

  if (error || !data) {
    throw parseProblemDetails(error ?? { detail: 'Falha no login' });
  }

  tokenStorage.setAccessToken(data.accessToken);
  tokenStorage.setRefreshToken(data.refreshToken);

  // Parse user info or create a user representation
  const user: AuthUser = {
    id: 'user-current',
    name: credentials.email.split('@')[0],
    email: credentials.email,
  };

  return { user, accessToken: data.accessToken };
}

export async function registerApi(data: RegisterInput): Promise<AuthUser> {
  const { data: resData, error } = await apiClient.POST('/auth/register', {
    body: data,
  });

  if (error || !resData) {
    throw parseProblemDetails(error ?? { detail: 'Falha no cadastro' });
  }

  return {
    id: resData.id,
    name: resData.name,
    email: resData.email,
  };
}

export async function logoutApi(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (refreshToken) {
    try {
      await apiClient.POST('/auth/logout', {
        body: { refreshToken },
      });
    } catch {
      // Ignore network errors during logout
    }
  }
  tokenStorage.clear();
}

export async function refreshSessionApi(): Promise<string> {
  return singleFlightRefreshToken();
}
