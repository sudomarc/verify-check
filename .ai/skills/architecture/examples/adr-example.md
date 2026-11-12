# ADR Example

## Context
A service needs durable background execution for order-processing jobs.

## Decision
Reuse the repository's existing queue abstraction rather than introducing a second broker client.

## Alternatives
A direct process-local worker was rejected because jobs already require retry and persistence semantics provided by the existing queue.

## Consequences
The change remains consistent with current operations and monitoring. Queue throughput limits remain a concern.

## Verification
Run worker tests, retry tests, and a local integration flow that enqueues and completes a job.
