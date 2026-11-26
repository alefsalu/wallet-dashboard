import React, { useState } from 'react';
import type { Wallet } from '@/types/api';
import { formatBRL } from '@/features/wallet/utils/currency';
import { Eye, EyeOff, Copy, Check, ArrowDownLeft, ArrowUpRight, Send } from 'lucide-react';

export interface BalanceCardProps {
  wallet?: Wallet;
  isLoading?: boolean;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
  onTransferClick: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  wallet,
  isLoading = false,
  onDepositClick,
  onWithdrawClick,
  onTransferClick,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyWalletId = () => {
    if (wallet?.id) {
      navigator.clipboard?.writeText(wallet.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
        <div className="h-8 bg-slate-200 rounded w-1/2 mb-6" />
        <div className="h-10 bg-slate-200 rounded w-full" />
      </div>
    );
  }

  const rawAmount = wallet?.balance?.amount || '0.00';

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Carteira Digital BRL
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400 font-mono">
              ID: {wallet?.id ? `${wallet.id.slice(0, 8)}...${wallet.id.slice(-4)}` : 'Carregando...'}
            </span>
            <button
              onClick={handleCopyWalletId}
              aria-label="Copiar ID da carteira"
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              title="Copiar ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowBalance(!showBalance)}
          aria-label={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 transition-colors border border-slate-700 w-fit"
        >
          {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}</span>
        </button>
      </div>

      <div className="mb-8">
        <p className="text-xs text-slate-400 mb-1">Saldo disponível</p>
        <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          {showBalance ? formatBRL(rawAmount) : '••••••'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/60">
        <button
          onClick={onDepositClick}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Depositar</span>
        </button>

        <button
          onClick={onWithdrawClick}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition-colors border border-slate-600/80"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Sacar</span>
        </button>

        <button
          onClick={onTransferClick}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition-colors border border-slate-600/80"
        >
          <Send className="w-4 h-4" />
          <span>Transferir</span>
        </button>
      </div>
    </div>
  );
};
