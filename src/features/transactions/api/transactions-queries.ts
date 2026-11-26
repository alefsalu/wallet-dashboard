import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { parseProblemDetails } from '@/lib/rfc7807';
import type { PageTransaction } from '@/types/api';

export function useTransactionsQuery(page = 0, size = 20) {
  return useQuery<PageTransaction>({
    queryKey: ['transactions', { page, size }],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/wallets/me/transactions', {
        params: {
          query: {
            page,
            size,
          },
        },
      });

      if (error || !data) {
        throw parseProblemDetails(error ?? { detail: 'Falha ao buscar histórico de transações' });
      }

      return data;
    },
    staleTime: 10_000,
  });
}
