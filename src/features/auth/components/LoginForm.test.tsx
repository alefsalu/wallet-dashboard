import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('LoginForm', () => {
  it('displays validation error if password is less than 12 characters', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitBtn = screen.getByRole('button', { name: /entrar/i });

    await userEvent.type(emailInput, 'test@wallet.local');
    await userEvent.type(passwordInput, 'short');
    await userEvent.click(submitBtn);

    expect(await screen.findByText(/mínimo 12 caracteres/i)).toBeInTheDocument();
  });
});
