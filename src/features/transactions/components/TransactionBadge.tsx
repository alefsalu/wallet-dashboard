import React from 'react';
import type { Transaction } from '@/types/api';
import { Badge } from '@/components/ui/Badge';

export interface TransactionBadgeProps {
  type: Transaction['type'];
  className?: string;
}

export const TransactionBadge: React.FC<TransactionBadgeProps> = ({ type, className }) => {
  const config = {
    DEPOSIT: { variant: 'success' as const, label: 'DEPOSIT' },
    WITHDRAWAL: { variant: 'warning' as const, label: 'WITHDRAWAL' },
    TRANSFER_IN: { variant: 'success' as const, label: 'TRANSFER_IN' },
    TRANSFER_OUT: { variant: 'danger' as const, label: 'TRANSFER_OUT' },
  };

  const current = config[type] || { variant: 'neutral' as const, label: type };

  return (
    <Badge variant={current.variant} className={className}>
      {current.label}
    </Badge>
  );
};
