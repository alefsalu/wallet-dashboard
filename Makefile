.PHONY: guard sync-contract up down test test-unit test-integration lint format ci

guard:
	./scripts/guard.sh

sync-contract:
	./scripts/sync-contract.sh

up:
	docker compose up -d

down:
	docker compose down

test: test-unit test-integration

test-unit:
	npm run test

test-integration:
	npm run test:e2e

lint:
	npm run lint

format:
	npm run format

ci: guard lint test
