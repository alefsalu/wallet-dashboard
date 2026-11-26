import { z } from 'zod';
import { moneyAmountSchema } from './money-schema';

export function createTransferSchema(currentWalletId: string) {
  return z.object({
    destinationWalletId: z
      .string()
      .min(1, 'A carteira de destino é obrigatória')
      .refine(
        (id) => id !== currentWalletId,
        'Não é permitido transferir para a própria carteira'
      ),
    amount: moneyAmountSchema,
    description: z
      .string()
      .max(100, 'A descrição deve ter no máximo 100 caracteres')
      .optional()
      .or(z.literal('')),
  });
}

export type TransferSchemaType = ReturnType<typeof createTransferSchema>;
