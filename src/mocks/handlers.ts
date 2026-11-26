import { http, HttpResponse } from 'msw';
import { mockDb, OTHER_WALLET_ID } from './fixtures';
import type { ProblemDetails, Transaction } from '@/types/api';

function createProblem(
  status: number,
  code: string,
  title: string,
  detail: string,
  instance: string,
  errors?: Array<{ field: string; message: string }>
): ProblemDetails {
  return {
    type: `https://api.wallet.local/errors/${code.toLowerCase()}`,
    title,
    status,
    detail,
    instance,
    code,
    errors,
  };
}

export const handlers = [
  // POST /api/v1/auth/register
  http.post('*/api/v1/auth/register', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!body.email || !body.name || !body.password || body.password.length < 12) {
      return HttpResponse.json(
        createProblem(
          400,
          'VALIDATION_ERROR',
          'Validation Error',
          'Invalid registration data',
          '*/api/v1/auth/register',
          [
            ...(body.password && body.password.length < 12
              ? [{ field: 'password', message: 'A senha deve ter no mínimo 12 caracteres' }]
              : []),
          ]
        ),
        { status: 400, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    const existing = mockDb.users.find((u) => u.email === body.email);
    if (existing) {
      return HttpResponse.json(
        createProblem(
          409,
          'EMAIL_ALREADY_REGISTERED',
          'Conflict',
          'Este e-mail já está cadastrado no sistema',
          '*/api/v1/auth/register'
        ),
        { status: 409, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      password: body.password,
    };
    mockDb.users.push(newUser);

    return HttpResponse.json(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      { status: 201 }
    );
  }),

  // POST /api/v1/auth/login
  http.post('*/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };

    const user = mockDb.users.find(
      (u) => u.email === body.email && u.password === body.password
    );

    if (!user) {
      return HttpResponse.json(
        createProblem(
          401,
          'UNAUTHORIZED',
          'Unauthorized',
          'Credenciais inválidas. Verifique seu e-mail e senha.',
          '*/api/v1/auth/login'
        ),
        { status: 401, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    return HttpResponse.json(
      {
        accessToken: `mock-jwt-token-for-${user.id}`,
        refreshToken: `mock-refresh-token-for-${user.id}`,
        tokenType: 'Bearer',
        expiresIn: 900,
      },
      { status: 200 }
    );
  }),

  // POST /api/v1/auth/refresh
  http.post('*/api/v1/auth/refresh', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { refreshToken?: string };
    if (!body.refreshToken || !body.refreshToken.startsWith('mock-refresh-token-')) {
      return HttpResponse.json(
        createProblem(
          401,
          'UNAUTHORIZED',
          'Unauthorized',
          'Refresh token inválido ou revogado',
          '*/api/v1/auth/refresh'
        ),
        { status: 401, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    return HttpResponse.json(
      {
        accessToken: `new-mock-jwt-token-${Date.now()}`,
        refreshToken: `new-mock-refresh-token-${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 900,
      },
      { status: 200 }
    );
  }),

  // POST /api/v1/auth/logout
  http.post('*/api/v1/auth/logout', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/v1/wallets/me
  http.get('*/api/v1/wallets/me', () => {
    return HttpResponse.json(mockDb.wallet, { status: 200 });
  }),

  // POST /api/v1/wallets/me/deposits
  http.post('*/api/v1/wallets/me/deposits', async ({ request }) => {
    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (!idempotencyKey) {
      return HttpResponse.json(
        createProblem(
          400,
          'VALIDATION_ERROR',
          'Bad Request',
          'O cabeçalho Idempotency-Key é obrigatório',
          '*/api/v1/wallets/me/deposits'
        ),
        { status: 400, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    const rawBody = await request.text();
    const cached = mockDb.idempotencyCache.get(idempotencyKey);
    if (cached) {
      if (cached.requestBody !== rawBody) {
        return HttpResponse.json(
          createProblem(
            422,
            'IDEMPOTENCY_KEY_REUSED',
            'Unprocessable Entity',
            'Idempotency-Key já utilizada com corpo de requisição diferente',
            '*/api/v1/wallets/me/deposits'
          ),
          { status: 422, headers: { 'Content-Type': 'application/problem+json' } }
        );
      }
      return HttpResponse.json(cached.responseData, {
        status: cached.responseStatus,
        headers: { 'Idempotent-Replayed': 'true' },
      });
    }

    const body = (JSON.parse(rawBody || '{}')) as { amount?: string };
    const numAmount = parseFloat(body.amount || '0');
    if (isNaN(numAmount) || numAmount <= 0) {
      return HttpResponse.json(
        createProblem(
          400,
          'VALIDATION_ERROR',
          'Validation Error',
          'O valor deve ser positivo',
          '*/api/v1/wallets/me/deposits'
        ),
        { status: 400, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    const currentBal = parseFloat(mockDb.wallet.balance.amount);
    const newBal = (currentBal + numAmount).toFixed(2);
    mockDb.wallet.balance.amount = newBal;

    const tx: Transaction = {
      id: crypto.randomUUID(),
      type: 'DEPOSIT',
      amount: { amount: numAmount.toFixed(2), currency: 'BRL' },
      balanceAfter: { amount: newBal, currency: 'BRL' },
      counterpartyWalletId: null,
      description: 'Depósito em conta',
      createdAt: new Date().toISOString(),
    };

    mockDb.transactions.unshift(tx);
    mockDb.idempotencyCache.set(idempotencyKey, {
      requestBody: rawBody,
      responseStatus: 201,
      responseData: tx,
    });

    return HttpResponse.json(tx, { status: 201 });
  }),

  // POST /api/v1/wallets/me/withdrawals
  http.post('*/api/v1/wallets/me/withdrawals', async ({ request }) => {
    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (!idempotencyKey) {
      return HttpResponse.json(
        createProblem(
          400,
          'VALIDATION_ERROR',
          'Bad Request',
          'O cabeçalho Idempotency-Key é obrigatório',
          '*/api/v1/wallets/me/withdrawals'
        ),
        { status: 400, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    const rawBody = await request.text();
    const cached = mockDb.idempotencyCache.get(idempotencyKey);
    if (cached) {
      if (cached.requestBody !== rawBody) {
        return HttpResponse.json(
          createProblem(
            422,
            'IDEMPOTENCY_KEY_REUSED',
            'Unprocessable Entity',
            'Idempotency-Key já utilizada com corpo de requisição diferente',
            '*/api/v1/wallets/me/withdrawals'
          ),
          { status: 422, headers: { 'Content-Type': 'application/problem+json' } }
        );
      }
      return HttpResponse.json(cached.responseData, {
        status: cached.responseStatus,
        headers: { 'Idempotent-Replayed': 'true' },
      });
    }

    const body = (JSON.parse(rawBody || '{}')) as { amount?: string };
    const numAmount = parseFloat(body.amount || '0');
    const currentBal = parseFloat(mockDb.wallet.balance.amount);

    if (currentBal < numAmount) {
      return HttpResponse.json(
        createProblem(
          422,
          'INSUFFICIENT_FUNDS',
          'Saldo Insuficiente',
          'Saldo insuficiente para realizar esta operação.',
          '*/api/v1/wallets/me/withdrawals'
        ),
        { status: 422, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    const newBal = (currentBal - numAmount).toFixed(2);
    mockDb.wallet.balance.amount = newBal;

    const tx: Transaction = {
      id: crypto.randomUUID(),
      type: 'WITHDRAWAL',
      amount: { amount: numAmount.toFixed(2), currency: 'BRL' },
      balanceAfter: { amount: newBal, currency: 'BRL' },
      counterpartyWalletId: null,
      description: 'Saque de recursos',
      createdAt: new Date().toISOString(),
    };

    mockDb.transactions.unshift(tx);
    mockDb.idempotencyCache.set(idempotencyKey, {
      requestBody: rawBody,
      responseStatus: 201,
      responseData: tx,
    });

    return HttpResponse.json(tx, { status: 201 });
  }),

  // POST /api/v1/transfers
  http.post('*/api/v1/transfers', async ({ request }) => {
    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (!idempotencyKey) {
      return HttpResponse.json(
        createProblem(
          400,
          'VALIDATION_ERROR',
          'Bad Request',
          'O cabeçalho Idempotency-Key é obrigatório',
          '*/api/v1/transfers'
        ),
        { status: 400, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    const rawBody = await request.text();
    const cached = mockDb.idempotencyCache.get(idempotencyKey);
    if (cached) {
      if (cached.requestBody !== rawBody) {
        return HttpResponse.json(
          createProblem(
            422,
            'IDEMPOTENCY_KEY_REUSED',
            'Unprocessable Entity',
            'Idempotency-Key já utilizada com corpo de requisição diferente',
            '*/api/v1/transfers'
          ),
          { status: 422, headers: { 'Content-Type': 'application/problem+json' } }
        );
      }
      return HttpResponse.json(cached.responseData, {
        status: cached.responseStatus,
        headers: { 'Idempotent-Replayed': 'true' },
      });
    }

    const body = (JSON.parse(rawBody || '{}')) as {
      destinationWalletId?: string;
      amount?: string;
      description?: string;
    };

    if (body.destinationWalletId === mockDb.wallet.id) {
      return HttpResponse.json(
        createProblem(
          422,
          'SAME_WALLET_TRANSFER',
          'Transferência Inválida',
          'Não é permitido transferir para a própria carteira',
          '*/api/v1/transfers'
        ),
        { status: 422, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    if (body.destinationWalletId !== OTHER_WALLET_ID && !body.destinationWalletId?.includes('-')) {
      return HttpResponse.json(
        createProblem(
          404,
          'WALLET_NOT_FOUND',
          'Carteira Não Encontrada',
          'A carteira de destino informada não foi localizada',
          '*/api/v1/transfers'
        ),
        { status: 404, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    const numAmount = parseFloat(body.amount || '0');
    const currentBal = parseFloat(mockDb.wallet.balance.amount);

    if (currentBal < numAmount) {
      return HttpResponse.json(
        createProblem(
          422,
          'INSUFFICIENT_FUNDS',
          'Saldo Insuficiente',
          'Saldo insuficiente para realizar esta operação.',
          '*/api/v1/transfers'
        ),
        { status: 422, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    const newBal = (currentBal - numAmount).toFixed(2);
    mockDb.wallet.balance.amount = newBal;

    const tx: Transaction = {
      id: crypto.randomUUID(),
      type: 'TRANSFER_OUT',
      amount: { amount: numAmount.toFixed(2), currency: 'BRL' },
      balanceAfter: { amount: newBal, currency: 'BRL' },
      counterpartyWalletId: body.destinationWalletId || null,
      description: body.description || 'Transferência entre carteiras',
      createdAt: new Date().toISOString(),
    };

    mockDb.transactions.unshift(tx);
    mockDb.idempotencyCache.set(idempotencyKey, {
      requestBody: rawBody,
      responseStatus: 201,
      responseData: tx,
    });

    return HttpResponse.json(tx, { status: 201 });
  }),

  // GET /api/v1/wallets/me/transactions
  http.get('*/api/v1/wallets/me/transactions', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '20', 10);

    const totalElements = mockDb.transactions.length;
    const totalPages = Math.ceil(totalElements / size) || 1;
    const start = page * size;
    const end = start + size;
    const content = mockDb.transactions.slice(start, end);

    return HttpResponse.json(
      {
        content,
        page,
        size,
        totalElements,
        totalPages,
      },
      { status: 200 }
    );
  }),
];
