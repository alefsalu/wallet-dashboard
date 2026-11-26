import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { moneyAmountSchema } from '../schemas/money-schema';
import { useWithdrawMutation } from '../api/operations-mutations';
import { createIdempotencyKey } from '@/lib/idempotency';
import { formatBRL } from '@/features/wallet/utils/currency';
import type { ProblemDetails } from '@/lib/rfc7807';

export interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance?: string;
}

const withdrawFormSchema = z.object({
  amount: moneyAmountSchema,
});

type WithdrawFormData = z.infer<typeof withdrawFormSchema>;

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  currentBalance = '0.00',
}) => {
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [serverError, setServerError] = useState<ProblemDetails | null>(null);

  const { mutateAsync, isPending } = useWithdrawMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<{ amount: string }>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: { amount: '' },
  });

  useEffect(() => {
    if (isOpen) {
      setIdempotencyKey(createIdempotencyKey());
      setServerError(null);
      reset({ amount: '' });
    }
  }, [isOpen, reset]);

  const rawAmount = watch('amount');

  const onSubmit = async (data: WithdrawFormData) => {
    setServerError(null);
    try {
      await mutateAsync({
        amount: data.amount,
        idempotencyKey,
      });
      onClose();
    } catch (err: unknown) {
      setServerError(err as ProblemDetails);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Saque">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <Alert variant="error" title={serverError.title}>
            {serverError.detail}
          </Alert>
        )}

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
          Saldo disponível para saque:{' '}
          <span className="font-bold text-slate-800">{formatBRL(currentBalance)}</span>
        </div>

        <div>
          <Input
            id="withdraw-amount"
            label="Valor do saque (R$)"
            placeholder="Ex: 50.00"
            error={errors.amount?.message}
            {...register('amount')}
          />
          {rawAmount && !errors.amount && (
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Valor a retirar: <span className="text-amber-600 font-semibold">{formatBRL(rawAmount)}</span>
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isPending}>
            Confirmar saque
          </Button>
        </div>
      </form>
    </Modal>
  );
};
