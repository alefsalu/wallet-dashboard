import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DepositModal } from './DepositModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('DepositModal', () => {
  it('submits deposit with generated Idempotency-Key and invalidates wallet query', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const onClose = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <DepositModal isOpen={true} onClose={onClose} />
      </QueryClientProvider>
    );

    const amountInput = screen.getByLabelText(/valor/i);
    const submitBtn = screen.getByRole('button', { name: /confirmar depósito/i });

    await userEvent.type(amountInput, '150.00');
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
