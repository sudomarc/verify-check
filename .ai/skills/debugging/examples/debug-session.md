# Example Debug Session

## Failure
The order list returns the first page repeatedly when a cursor is supplied.

## Reproducer
Call the endpoint twice with the returned cursor using the same fixture dataset.

## Localization
The database query receives identical bounds on both calls.

## Hypothesis
The cursor is being decoded but the decoded timestamp is discarded during query construction.

## Test
Log the query parameters in a test-only assertion and compare them with the decoded cursor.

## Result
The timestamp was parsed into a local variable but the query used the original request value, which was empty on the second request.

## Fix
Pass the decoded cursor object to the query builder.

## Regression
Re-run the reproducer and page-boundary tests.
