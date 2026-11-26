import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BalanceCard } from '../components/BalanceCard';
import { RecentTransactionsWidget } from '../components/RecentTransactionsWidget';
import { useWalletQuery, useRecentTransactionsQuery } from '@/features/wallet/api/wallet-queries';

import { DepositModal } from '@/features/operations/components/DepositModal';
import { WithdrawModal } from '@/features/operations/components/WithdrawModal';
import { TransferModal } from '@/features/operations/components/TransferModal';

export const DashboardPage: React.FC = () => {
  const { data: wallet, isLoading: isWalletLoading } = useWalletQuery();
  const { data: recentPage, isLoading: isRecentLoading } = useRecentTransactionsQuery();

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-sm text-slate-500">
            Monitore seu saldo, realize depósitos, saques e transferências em tempo real.
          </p>
        </div>

        <BalanceCard
          wallet={wallet}
          isLoading={isWalletLoading}
          onDepositClick={() => setDepositOpen(true)}
          onWithdrawClick={() => setWithdrawOpen(true)}
          onTransferClick={() => setTransferOpen(true)}
        />

        <RecentTransactionsWidget
          transactions={recentPage?.content}
          isLoading={isRecentLoading}
        />

        <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
        <WithdrawModal
          isOpen={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
          currentBalance={wallet?.balance?.amount}
        />
        <TransferModal
          isOpen={transferOpen}
          onClose={() => setTransferOpen(false)}
          currentWalletId={wallet?.id || ''}
        />
      </div>
    </AppLayout>
  );
};
