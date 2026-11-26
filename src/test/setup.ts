import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/mocks/server';
import { mockDb } from '@/mocks/fixtures';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  mockDb.reset();
});

afterAll(() => {
  server.close();
});
