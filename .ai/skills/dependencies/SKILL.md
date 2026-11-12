---
name: dependencies
description: This skill should be used when adding, removing, upgrading, pinning, auditing, or replacing software dependencies.
---

# Dependencies Skill

Establish necessity first. Inspect existing dependencies and lockfiles. Check compatibility with the project runtime and package manager. Prefer maintained, well-supported packages already aligned with project architecture. Understand transitive impact, licensing constraints, install/build effects, and rollback strategy.

For external provider integrations, also distinguish:

- direct runtime dependencies;
- optional provider dependencies;
- system/CLI dependencies;
- remote services and MCP providers;
- browser extensions or local browser prerequisites.

Do not treat a dependency as healthy merely because it is installed or importable. Where practical, verify the capability through a safe public-interface probe.

For volatile upstream tools:

- prefer released versions or explicit constraints;
- pin an exact commit when a moving upstream reference would undermine reproducibility or incident recovery;
- record the reason for the pin and the upgrade path;
- keep fallback providers explicit when compatibility differs.

Never modify dependency manifests and lockfiles inconsistently.

References: `references/dependency-decision.md`, `references/lockfiles.md`, `examples/dependency-change.md`.
