# Migration Checklist

Identify current schema, data volume, lock behavior, backwards compatibility, deployment order, backfill strategy, failure recovery, rollback limits, and validation queries.

Prefer expand-and-contract patterns for live systems when the database and deployment topology require compatibility across versions.
