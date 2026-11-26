# Architecture

## C4 — Context

```mermaid
flowchart LR
  user([Wallet user]) --> dash[wallet-dashboard<br/>React SPA]
  dash -->|REST + JWT| api[wallet-api<br/>Spring Boot]
```

## C4 — Container

```mermaid
flowchart TB
  subgraph "wallet-dashboard (Docker)"
    nginx[nginx-unprivileged :8080<br/>static files, CSP, SPA fallback]
  end
  browser[Browser runtime<br/>React 19 + TanStack Query] -->|loads| nginx
  browser -->|/api/v1 JSON| api[wallet-api :8080]
```

## Request lifecycle

```mermaid
sequenceDiagram
  participant UI
  participant Client as api-client middleware
  participant API as wallet-api
  UI->>Client: POST /transfers (Idempotency-Key K)
  Client->>API: + Authorization, X-Correlation-Id
  API-->>Client: 401 (access token expired)
  Client->>API: POST /auth/refresh (single flight)
  API-->>Client: new token pair
  Client->>API: retry POST /transfers (same key K)
  API-->>UI: 201 Transaction
```

## Key rules

- The access token lives only in JS memory. The refresh token is persisted so the session survives a page reload, and it is rotated on every use.
- Concurrent 401s share one refresh promise (`createSingleFlightRefresh`).
- Each money operation creates one `Idempotency-Key` when the form is submitted and reuses it on retry.
- Server errors arrive as RFC 7807 and are mapped to UI text and field errors.
