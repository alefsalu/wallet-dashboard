import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BalanceCard } from './BalanceCard';

describe('BalanceCard', () => {
  it('toggles balance visibility on button click', async () => {
    render(
      <BalanceCard
        wallet={{
          id: 'w1',
          ownerId: 'u1',
          balance: { amount: '1250.00', currency: 'BRL' },
          createdAt: '2026-11-25T00:00:00Z',
        }}
        isLoading={false}
        onDepositClick={vi.fn()}
        onWithdrawClick={vi.fn()}
        onTransferClick={vi.fn()}
      />
    );

    expect(screen.getByText(/1\.250,00/)).toBeInTheDocument();
    const toggleBtn = screen.getByRole('button', { name: /ocultar saldo|mostrar saldo/i });
    await userEvent.click(toggleBtn);
    expect(screen.queryByText(/1\.250,00/)).not.toBeInTheDocument();
    expect(screen.getByText('••••••')).toBeInTheDocument();
  });
});
