import React from 'react';
import type { Transaction } from '@/types/api';
import { formatBRL } from '@/features/wallet/utils/currency';
import { TransactionBadge } from './TransactionBadge';

export interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden p-6 space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-slate-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <p className="text-base font-medium">Nenhuma transação registrada</p>
        <p className="text-xs text-slate-400 mt-1">
          Suas operações de depósito, saque e transferência aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Tabela de Transações">
          <caption className="sr-only">Histórico de movimentações da conta</caption>
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th scope="col" className="px-6 py-3.5">
                Data / Hora
              </th>
              <th scope="col" className="px-6 py-3.5">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3.5">
                Descrição
              </th>
              <th scope="col" className="px-6 py-3.5">
                Contraparte
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Valor
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Saldo Resultante
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN';
              return (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                    {new Date(tx.createdAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TransactionBadge type={tx.type} />
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-medium">
                    {tx.description || 'Operação sem descrição'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                    {tx.counterpartyWalletId
                      ? `${tx.counterpartyWalletId.slice(0, 8)}...${tx.counterpartyWalletId.slice(-4)}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                    <span className={isCredit ? 'text-emerald-600' : 'text-slate-900'}>
                      {isCredit ? '+' : '-'} {formatBRL(tx.amount.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-slate-500 font-mono">
                    {formatBRL(tx.balanceAfter.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
