import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithdrawModal } from './WithdrawModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('WithdrawModal', () => {
  it('submits withdrawal and closes on success', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const onClose = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <WithdrawModal isOpen={true} onClose={onClose} currentBalance="500.00" />
      </QueryClientProvider>
    );

    const amountInput = screen.getByLabelText(/valor/i);
    const submitBtn = screen.getByRole('button', { name: /confirmar saque/i });

    await userEvent.type(amountInput, '50.00');
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
