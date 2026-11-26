import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthContextValue, AuthUser, LoginInput, RegisterInput } from '../types';
import { loginApi, registerApi, logoutApi, refreshSessionApi } from '../api/auth-queries';
import { tokenStorage } from '@/lib/auth-token-storage';
import { onAuthExpired } from '@/lib/api-client';

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const hasRefreshToken = !!tokenStorage.getRefreshToken();
    if (hasRefreshToken) {
      return { id: 'user-current', name: 'Usuário', email: 'dev@wallet.local' };
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!tokenStorage.getRefreshToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      tokenStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthExpired(() => {
      setUser(null);
      setIsAuthenticated(false);
    });

    const initAuth = async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken && !tokenStorage.getAccessToken()) {
        try {
          setIsLoading(true);
          await refreshSessionApi();
          setIsAuthenticated(true);
        } catch {
          await logout();
        } finally {
          setIsLoading(false);
        }
      }
    };

    initAuth();
    return () => unsubscribe();
  }, [logout]);

  const login = async (credentials: LoginInput) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await loginApi(credentials);
      setUser(loggedInUser);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await registerApi(data);
      // Auto login after register
      await login({ email: data.email, password: data.password });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
