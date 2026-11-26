import React from 'react';
import { Link } from 'react-router';
import type { Transaction } from '@/types/api';
import { formatBRL } from '@/features/wallet/utils/currency';
import { Badge } from '@/components/ui/Badge';
import { ArrowDownLeft, ArrowUpRight, Send, ArrowRight } from 'lucide-react';

export interface RecentTransactionsWidgetProps {
  transactions?: Transaction[];
  isLoading?: boolean;
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  transactions = [],
  isLoading = false,
}) => {
  const getBadgeVariant = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
      case 'TRANSFER_IN':
        return 'success';
      case 'WITHDRAWAL':
        return 'warning';
      case 'TRANSFER_OUT':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
      case 'TRANSFER_IN':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="w-4 h-4 text-amber-600" />;
      case 'TRANSFER_OUT':
        return <Send className="w-4 h-4 text-rose-600" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Depósito';
      case 'WITHDRAWAL':
        return 'Saque';
      case 'TRANSFER_IN':
        return 'Transferência recebida';
      case 'TRANSFER_OUT':
        return 'Transferência enviada';
      default:
        return type;
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Transações Recentes</h2>
          <p className="text-xs text-slate-500">Últimas movimentações da sua conta</p>
        </div>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <span>Ver todas</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          Nenhuma transação recente encontrada.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100" role="list">
          {transactions.map((tx) => {
            const isPositive = tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN';
            return (
              <li key={tx.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                    {getIcon(tx.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        {tx.description || getTypeLabel(tx.type)}
                      </span>
                      <Badge variant={getBadgeVariant(tx.type)}>{tx.type}</Badge>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      isPositive ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isPositive ? '+' : '-'} {formatBRL(tx.amount.amount)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
