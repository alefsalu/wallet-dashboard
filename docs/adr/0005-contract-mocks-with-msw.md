# 5. Contract-based mocks with MSW

- Status: accepted

## Context
E2E tests in CI cannot depend on the backend being published and running.

## Decision
Build MSW handlers from the OpenAPI contract and reuse them in unit tests, local dev and Playwright runs in CI. An optional job (`compose.e2e.yml`) runs the same E2E suite against the real API.

## Consequences
CI is fast and deterministic. The real-API job catches the cases where the mocks drift from the API.
