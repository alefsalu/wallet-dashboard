# 1. Feature-based folder structure

- Status: accepted

## Context
Layer-based folders (`components/`, `hooks/`, `services/`) scatter one feature across the tree.

## Decision
Group code by business feature (`auth`, `operations`, `transactions`, `wallet`, `dashboard`). Shared, feature-agnostic code goes in `lib/` and `components/ui`.

## Consequences
A feature can be read, changed or deleted in one place. Cross-feature imports go through public modules and stay visible in review.
