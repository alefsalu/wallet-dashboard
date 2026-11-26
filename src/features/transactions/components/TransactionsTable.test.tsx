import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionsTable } from './TransactionsTable';
import type { Transaction } from '@/types/api';

describe('TransactionsTable', () => {
  it('renders list of transactions with correct type badges and amounts', () => {
    const mockTx: Transaction[] = [
      {
        id: 'tx-1',
        type: 'DEPOSIT',
        amount: { amount: '250.00', currency: 'BRL' },
        balanceAfter: { amount: '1250.00', currency: 'BRL' },
        counterpartyWalletId: null,
        description: 'Depósito via Pix',
        createdAt: '2026-11-25T14:00:00Z',
      },
    ];

    render(<TransactionsTable transactions={mockTx} />);
    expect(screen.getByText(/Depósito via Pix/i)).toBeInTheDocument();
    expect(screen.getByText('DEPOSIT')).toBeInTheDocument();
    expect(screen.getByText(/\+\s*R\$\s*250,00/)).toBeInTheDocument();
  });
});
