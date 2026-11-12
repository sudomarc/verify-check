---
name: architecture
description: This skill should be used when choosing system boundaries, modules, interfaces, data flow, deployment topology, or architectural trade-offs.
---

# Architecture Skill

Inspect before redesigning. Map current components, ownership, dependencies, data flow, external interfaces, failure boundaries, and operational constraints. Prefer incremental changes that preserve working contracts.

Compare alternatives by correctness, complexity, compatibility, migration cost, operational burden, and reversibility. Avoid architecture astronautics: do not introduce distributed systems, abstraction layers, or event infrastructure without a demonstrated requirement.

References: `references/architecture-decision-record.md`, `references/system-map.md`, `examples/adr-example.md`.
