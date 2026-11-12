# Example Batch Report

## Purpose
Introduce the request-validation helper without changing endpoint behavior.

## Changed
`src/http/orders.ts`
`src/http/orders.test.ts`

## Verification
Ran the focused orders test suite and type checking.

## Result
The helper is used by the endpoint, existing valid requests remain accepted, malformed pagination input is rejected, and all focused checks pass.

## Next
Implement the response metadata batch.
