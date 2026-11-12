# Example: Add a Health Endpoint

## Goal

Expose `GET /health` that returns HTTP 200 and a stable JSON body when the application process is running.

## Context

The repository uses an existing HTTP router and has integration tests for public endpoints. No health route exists. The deployment platform checks process availability but has no application-level endpoint.

## Scope

Included: route registration, handler, focused integration test, documentation of the endpoint.

Excluded: database dependency checks, authentication changes, new observability stack, deployment configuration.

## Files

- `src/routes/health.ts` — add handler.
- `src/router.ts` — register route.
- `test/health.test.ts` — add regression test.
- `docs/operations.md` — document contract.

## Decisions

- Use the existing router.
- Return a minimal JSON body: `{ "status": "ok" }`.
- Keep the endpoint unauthenticated because its purpose is process health.
- Do not query external dependencies from the basic liveness endpoint.

## Risks

A monitoring client could mistake HTTP 200 for full system health. Mitigation: document the endpoint as liveness only and keep dependency readiness separate.

## Verification

- Run the focused health integration test.
- Run the repository type check.
- Run the existing route test suite if fast enough.
- Inspect the diff and repository status.

## Approval

Not required when the task is explicitly authorized as a liveness endpoint within the existing HTTP API.

## Implementation batches

Batch 1: add handler and route.
Batch 2: add test and documentation.
Batch 3: run verification and inspect diff.
