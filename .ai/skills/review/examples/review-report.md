# Example Review Report

## Scope
Reviewed the final diff for the order-pagination change.

## Findings

`Important | 92% confidence | src/http/orders.ts:74 | Cursor token is accepted without checking the decoded account scope | The existing customer endpoint validates scope before query execution | Reuse the existing scoped-cursor validator`

## Verification Gap
The integration suite was not available in the local environment. Focused endpoint tests and type checking were run.

## Conclusion
One high-confidence issue remains before release.
