import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { MemoryRouter, Routes, Route } from 'react-router';
import { AuthContext } from '../features/auth/context/AuthContext';

describe('ProtectedRoute', () => {
  it('redirects unauthenticated user to /login', () => {
    render(
      <AuthContext.Provider
        value={{
          isAuthenticated: false,
          isLoading: false,
          user: null,
          login: async () => {},
          register: async () => {},
          logout: async () => {},
        }}
      >
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    render(
      <AuthContext.Provider
        value={{
          isAuthenticated: true,
          isLoading: false,
          user: { id: 'u1', name: 'Dev', email: 'dev@wallet.local' },
          login: async () => {},
          register: async () => {},
          logout: async () => {},
        }}
      >
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
