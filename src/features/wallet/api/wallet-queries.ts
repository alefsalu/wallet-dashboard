import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { parseProblemDetails } from '@/lib/rfc7807';
import type { Wallet, PageTransaction } from '@/types/api';

export function useWalletQuery() {
  return useQuery<Wallet>({
    queryKey: ['wallets', 'me'],
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET('/wallets/me');
      if (error || !data) {
        throw parseProblemDetails(error || { status: response.status, detail: 'Falha ao buscar carteira' });
      }
      return data;
    },
    staleTime: 30_000,
  });
}

export function useRecentTransactionsQuery() {
  return useQuery<PageTransaction>({
    queryKey: ['transactions', 'recent'],
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET('/wallets/me/transactions', {
        params: {
          query: {
            page: 0,
            size: 5,
          },
        },
      });
      if (error || !data) {
        throw parseProblemDetails(error || { status: response.status, detail: 'Falha ao buscar transações recentes' });
      }
      return data;
    },
    staleTime: 15_000,
  });
}
