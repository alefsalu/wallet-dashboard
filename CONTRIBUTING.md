# Contributing

1. `npm ci`
2. Create a branch: `feat/...` or `fix/...`
3. Use Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `ci:`, `chore:`).
4. Run `make ci` before opening a PR.
5. If the API contract changes, run `make sync-contract && npm run codegen:api` and commit both.
