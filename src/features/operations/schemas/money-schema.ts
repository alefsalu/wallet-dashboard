import { z } from 'zod';

export const moneyAmountSchema = z
  .string()
  .min(1, 'O valor é obrigatório')
  .regex(/^\d+(\.\d{1,2})?$/, 'Formato inválido. Use até duas casas decimais (ex: 10.50)')
  .refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: 'O valor deve ser maior que zero' }
  )
  .refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num <= 1000000.0;
    },
    { message: 'O valor máximo permitido por operação é R$ 1.000.000,00' }
  )
  .transform((val) => {
    const num = parseFloat(val);
    return num.toFixed(2);
  });
