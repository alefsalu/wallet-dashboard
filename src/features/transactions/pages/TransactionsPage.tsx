import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TransactionsTable } from '../components/TransactionsTable';
import { PaginationControls } from '../components/PaginationControls';
import { useTransactionsQuery } from '../api/transactions-queries';

export const TransactionsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading } = useTransactionsQuery(page, pageSize);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Extrato de Transações</h1>
          <p className="text-sm text-slate-500">
            Histórico completo e detalhado de todas as movimentações da sua carteira.
          </p>
        </div>

        <TransactionsTable
          transactions={data?.content || []}
          isLoading={isLoading}
        />

        {data && data.totalPages > 1 && (
          <PaginationControls
            page={page}
            totalPages={data.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>
    </AppLayout>
  );
};
