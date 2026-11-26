import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { createTransferSchema } from '../schemas/transfer-schema';
import { useTransferMutation } from '../api/operations-mutations';
import { createIdempotencyKey } from '@/lib/idempotency';
import { formatBRL } from '@/features/wallet/utils/currency';
import type { ProblemDetails } from '@/lib/rfc7807';

export interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWalletId: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  currentWalletId,
}) => {
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [serverError, setServerError] = useState<ProblemDetails | null>(null);

  const transferSchema = createTransferSchema(currentWalletId);
  type TransferFormData = z.infer<typeof transferSchema>;

  const { mutateAsync, isPending } = useTransferMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<{ destinationWalletId: string; amount: string; description?: string }>({
    resolver: zodResolver(transferSchema),
    defaultValues: { destinationWalletId: '', amount: '', description: '' },
  });

  useEffect(() => {
    if (isOpen) {
      setIdempotencyKey(createIdempotencyKey());
      setServerError(null);
      reset({ destinationWalletId: '', amount: '', description: '' });
    }
  }, [isOpen, reset]);

  const rawAmount = watch('amount');

  const onSubmit = async (data: TransferFormData) => {
    setServerError(null);
    try {
      await mutateAsync({
        destinationWalletId: data.destinationWalletId,
        amount: data.amount,
        description: data.description,
        idempotencyKey,
      });
      onClose();
    } catch (err: unknown) {
      setServerError(err as ProblemDetails);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transferência entre Carteiras">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <Alert variant="error" title={serverError.title}>
            {serverError.detail}
          </Alert>
        )}

        <div>
          <Input
            id="transfer-destination"
            label="Carteira de destino (ID / UUID)"
            placeholder="Ex: 33333333-3333-4333-8333-333333333333"
            error={errors.destinationWalletId?.message}
            {...register('destinationWalletId')}
          />
        </div>

        <div>
          <Input
            id="transfer-amount"
            label="Valor da transferência (R$)"
            placeholder="Ex: 100.00"
            error={errors.amount?.message}
            {...register('amount')}
          />
          {rawAmount && !errors.amount && (
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Valor a debitar: <span className="text-emerald-600 font-semibold">{formatBRL(rawAmount)}</span>
            </p>
          )}
        </div>

        <div>
          <Input
            id="transfer-description"
            label="Descrição (opcional)"
            placeholder="Ex: Pagamento de serviços"
            maxLength={100}
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Proteção contra cobrança dupla</p>
          <p>
            Chave de idempotência ativa: <span className="font-mono text-slate-600">{idempotencyKey.slice(0, 18)}...</span>
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isPending}>
            Confirmar transferência
          </Button>
        </div>
      </form>
    </Modal>
  );
};
