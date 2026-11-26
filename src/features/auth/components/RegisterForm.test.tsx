import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from './RegisterForm';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('RegisterForm', () => {
  it('displays validation error for password shorter than 12 chars', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <RegisterForm />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    const nameInput = screen.getByLabelText(/nome/i);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitBtn = screen.getByRole('button', { name: /cadastrar/i });

    await userEvent.type(nameInput, 'Alef Salu');
    await userEvent.type(emailInput, 'alef@example.com');
    await userEvent.type(passwordInput, '123456');
    await userEvent.click(submitBtn);

    expect(await screen.findByText(/mínimo 12 caracteres/i)).toBeInTheDocument();
  });
});
