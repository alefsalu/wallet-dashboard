import { describe, it, expect } from 'vitest';
import { createTransferSchema } from './transfer-schema';

describe('createTransferSchema', () => {
  it('rejects transfer when destination wallet ID is equal to current wallet ID', () => {
    const schema = createTransferSchema('wallet-current-uuid');
    const result = schema.safeParse({
      destinationWalletId: 'wallet-current-uuid',
      amount: '50.00',
      description: 'Self transfer',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/não pode transferir para a própria carteira/i);
  });

  it('accepts valid transfer to different wallet ID', () => {
    const schema = createTransferSchema('wallet-current-uuid');
    const result = schema.safeParse({
      destinationWalletId: '33333333-3333-4333-8333-333333333333',
      amount: '75.50',
      description: 'Pagamento de almoço',
    });
    expect(result.success).toBe(true);
  });
});
