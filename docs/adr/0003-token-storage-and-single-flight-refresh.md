# 3. Token storage and single-flight refresh

- Status: accepted

## Context
Tokens in `localStorage` are readable by any XSS. Keeping everything in memory forces a new login on every reload.

## Decision
Keep the short-lived access token (15 min) in memory only. Persist the opaque refresh token, which the server rotates on every use and revokes as a whole family if one is reused. Concurrent 401s share one refresh request.

## Consequences
A stolen access token is short-lived, and a replayed refresh token is detected by the server. A strict CSP reduces XSS risk. Moving to an httpOnly cookie would need a backend change (documented as future work).
