import type { JsonBodyType } from 'msw';
import type { Wallet, Transaction } from '@/types/api';

export const INITIAL_USER = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Dev User',
  email: 'dev@wallet.local',
  password: 'StrongPassw0rd123!',
};

export const INITIAL_WALLET: Wallet = {
  id: '22222222-2222-4222-8222-222222222222',
  ownerId: '11111111-1111-4111-8111-111111111111',
  balance: {
    amount: '1000.00',
    currency: 'BRL',
  },
  createdAt: '2026-11-25T10:00:00.000Z',
};

export const OTHER_WALLET_ID = '33333333-3333-4333-8333-333333333333';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1001-uuid',
    type: 'DEPOSIT',
    amount: { amount: '1000.00', currency: 'BRL' },
    balanceAfter: { amount: '1000.00', currency: 'BRL' },
    counterpartyWalletId: null,
    description: 'Depósito inicial Pix',
    createdAt: '2026-11-25T10:05:00.000Z',
  },
];

class MockDatabase {
  public wallet: Wallet = { ...INITIAL_WALLET, balance: { ...INITIAL_WALLET.balance } };
  public transactions: Transaction[] = [...INITIAL_TRANSACTIONS];
  public users = [{ ...INITIAL_USER }];
  public idempotencyCache = new Map<
    string,
    { requestBody: string; responseStatus: number; responseData: JsonBodyType }
  >();

  reset() {
    this.wallet = { ...INITIAL_WALLET, balance: { ...INITIAL_WALLET.balance } };
    this.transactions = [...INITIAL_TRANSACTIONS];
    this.users = [{ ...INITIAL_USER }];
    this.idempotencyCache.clear();
  }
}

export const mockDb = new MockDatabase();
