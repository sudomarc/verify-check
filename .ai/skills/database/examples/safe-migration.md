# Example Safe Migration

Add a nullable index-backed column first. Deploy code that can read both states. Backfill in bounded batches. Validate counts and constraints. Switch writes. Only remove the old field after dependent versions are gone.

Document the one-way steps when rollback cannot simply reverse the data transformation.
