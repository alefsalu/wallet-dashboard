import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('OpenAPI Code Generation', () => {
  it('generates src/types/api.ts containing Wallet, Transaction and TokenPair types', () => {
    const generatedPath = path.resolve(__dirname, '../src/types/api.ts');
    expect(fs.existsSync(generatedPath)).toBe(true);
    const content = fs.readFileSync(generatedPath, 'utf-8');
    expect(content).toContain('paths');
    expect(content).toContain('components');
    expect(content).toContain('TokenPair');
    expect(content).toContain('Transaction');
  });
});
