---
name: database
description: This skill should be used when changing schemas, migrations, queries, indexes, constraints, seed data, or persistence behavior.
---

# Database Skill

Inspect the current schema, migration system, data volume assumptions, indexes, constraints, and rollback mechanism. Separate schema correctness from data transformation. Prefer additive, backwards-compatible migrations when operationally appropriate. Validate query plans for material performance changes.

Destructive data changes require explicit authorization and a recovery strategy.

References: `references/migration-checklist.md`, `references/query-safety.md`, `examples/safe-migration.md`.
