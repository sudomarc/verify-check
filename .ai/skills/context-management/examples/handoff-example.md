# Example Handoff

## Objective
Finish cursor pagination for the orders endpoint.

## Current Repository State
Feature code and focused tests are implemented. Final diff review remains open.

## Applicable Instructions
AGENTS.md, .ai/skills/api/SKILL.md, and repository-local API test conventions.

## Decisions Already Made
Use cursor pagination with the existing response envelope; do not add a dependency.

## Files Changed
src/http/orders.ts
src/http/orders.test.ts

## Verification Performed
npm test -- orders — PASS.
Type checking — PASS.

## Known Failures
Integration suite not run because the required service is unavailable locally.

## Open Questions
Whether the CI integration environment exposes the required service contract.

## Risks
The integration behavior remains unverified locally.

## Exact Next Actions
1. Inspect git diff.
2. Run the documented integration suite if the service is available.
3. Verify the final response shape against the existing API contract.

## Completion Criteria
Focused tests, type checking, final diff review, and the applicable integration verification are complete.
