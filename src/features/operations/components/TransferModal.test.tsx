import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransferModal } from './TransferModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('TransferModal', () => {
  it('displays error alert on destination equal to current wallet', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <TransferModal isOpen={true} onClose={vi.fn()} currentWalletId="my-wallet" />
      </QueryClientProvider>
    );

    const destInput = screen.getByLabelText(/carteira de destino/i);
    const amountInput = screen.getByLabelText(/valor/i);
    const submitBtn = screen.getByRole('button', { name: /confirmar transferência/i });

    await userEvent.type(destInput, 'my-wallet');
    await userEvent.type(amountInput, '100.00');
    await userEvent.click(submitBtn);

    expect(await screen.findByText(/não é permitido transferir para a própria carteira/i)).toBeInTheDocument();
  });
});
