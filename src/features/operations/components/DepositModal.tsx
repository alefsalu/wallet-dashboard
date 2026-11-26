import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { moneyAmountSchema } from '../schemas/money-schema';
import { useDepositMutation } from '../api/operations-mutations';
import { createIdempotencyKey } from '@/lib/idempotency';
import { formatBRL } from '@/features/wallet/utils/currency';
import type { ProblemDetails } from '@/lib/rfc7807';

export interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const depositFormSchema = z.object({
  amount: moneyAmountSchema,
});

type DepositFormData = z.infer<typeof depositFormSchema>;

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [serverError, setServerError] = useState<ProblemDetails | null>(null);

  const { mutateAsync, isPending } = useDepositMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<{ amount: string }>({
    resolver: zodResolver(depositFormSchema),
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

  const onSubmit = async (data: DepositFormData) => {
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
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Depósito">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <Alert variant="error" title={serverError.title}>
            {serverError.detail}
          </Alert>
        )}

        <div>
          <Input
            id="deposit-amount"
            label="Valor do depósito (R$)"
            placeholder="Ex: 150.00"
            error={errors.amount?.message}
            {...register('amount')}
          />
          {rawAmount && !errors.amount && (
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Pré-visualização: <span className="text-emerald-600 font-semibold">{formatBRL(rawAmount)}</span>
            </p>
          )}
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Garantia de Idempotência</p>
          <p>
            Chave da operação: <span className="font-mono text-slate-600">{idempotencyKey.slice(0, 18)}...</span>
          </p>
          <p>Mesmo em caso de falha de conexão, retentativas não resultarão em crédito duplicado.</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isPending}>
            Confirmar depósito
          </Button>
        </div>
      </form>
    </Modal>
  );
};
