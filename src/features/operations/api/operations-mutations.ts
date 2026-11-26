import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { parseProblemDetails } from '@/lib/rfc7807';
import type { Transaction } from '@/types/api';

export interface OperationPayload {
  amount: string;
  idempotencyKey: string;
}

export async function depositApi({ amount, idempotencyKey }: OperationPayload): Promise<Transaction> {
  const { data, error, response } = await apiClient.POST('/wallets/me/deposits', {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
    body: {
      amount,
    },
  });

  if (error || !data) {
    throw parseProblemDetails(error || { status: response.status, detail: 'Falha ao processar depósito' });
  }

  return data;
}

export async function withdrawApi({ amount, idempotencyKey }: OperationPayload): Promise<Transaction> {
  const { data, error, response } = await apiClient.POST('/wallets/me/withdrawals', {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
    body: {
      amount,
    },
  });

  if (error || !data) {
    throw parseProblemDetails(error || { status: response.status, detail: 'Falha ao processar saque' });
  }

  return data;
}

export function useDepositMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: depositApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useWithdrawMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: withdrawApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
