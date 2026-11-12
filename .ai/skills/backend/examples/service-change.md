# Example Service Change

A payment retry operation must be idempotent.

Inspect the existing transaction and idempotency-key pattern before implementing. Add the operation to the same abstraction, persist the key at the correct boundary, test repeated requests, and verify failure recovery.
