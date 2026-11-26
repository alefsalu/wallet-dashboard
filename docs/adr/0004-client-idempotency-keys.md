# 4. Client-generated idempotency keys

- Status: accepted

## Context
Double clicks, timeouts and automatic retries can send the same money operation twice.

## Decision
Generate one UUID `Idempotency-Key` when the user submits a deposit, withdrawal or transfer, and reuse it on every retry of that submission. The API replays the original response.

## Consequences
Retries are safe and money never moves twice. A new submission gets a new key.
