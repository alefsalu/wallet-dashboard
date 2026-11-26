# 2. Typed API client generated from OpenAPI

- Status: accepted

## Context
Hand-written DTOs drift from the backend silently, and the drift only shows up at runtime.

## Decision
Pin the `wallet-api` contract in `contracts/`, generate types with `openapi-typescript` and call the API through `openapi-fetch`.

## Consequences
A contract change that breaks the UI fails at compile time. `make sync-contract` makes updating the contract an explicit, reviewable step.
