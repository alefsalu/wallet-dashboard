import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from './Navbar';
import { BrowserRouter } from 'react-router';
import { AuthContext } from '@/features/auth/context/AuthContext';

describe('Navbar component', () => {
  it('renders navigation links and handles logout click', async () => {
    const logoutMock = vi.fn();
    render(
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            isAuthenticated: true,
            isLoading: false,
            user: { id: 'u1', name: 'Dev User', email: 'dev@wallet.local' },
            login: async () => {},
            register: async () => {},
            logout: logoutMock,
          }}
        >
          <Navbar />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText(/dev@wallet.local/i)).toBeInTheDocument();
    const logoutBtn = screen.getByRole('button', { name: /sair/i });
    await userEvent.click(logoutBtn);
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
