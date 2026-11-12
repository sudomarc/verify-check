---
name: provider-integration
description: >-
  Use when adapting this instruction system to Codex, Claude Code, ChatGPT coding workflows, GitHub Copilot, or another agent host with different discovery and tooling semantics.
---

# Provider Integration Skill

## When to Use

Use when installing, adapting, or troubleshooting the instruction system for a specific coding-agent provider.

## When Not to Use

Do not use it to replace the provider's current official documentation or to assume identical behavior across hosts.

## Workflow

1. Identify the provider and exact product/surface.
2. Consult current primary documentation.
3. Identify supported instruction locations and precedence.
4. Map this repository's core, skills, references, and templates to those mechanisms.
5. Document capability gaps rather than inventing parity.
6. Verify the integration with a small representative task.
7. When the provider exposes multiple tools or backend paths, model the required capability separately from the specific provider implementation.

## Decision Rules

- Provider facts are version-sensitive.
- Provider-specific adapters must not silently change the portable core policy.
- Unsupported automatic skill loading must be handled explicitly.
- Real task verification outranks claimed compatibility.
- Prefer observable capability checks over package/configuration presence.
- When multiple implementation paths exist, use explicit primary/fallback routing and record the reason for ordering.
- Keep provider state, credentials and caches in dedicated locations rather than the project workspace.
- Use dry-run/read-only inspection before mutating host state.
- Pin or constrain volatile provider dependencies when reproducibility matters.

## Checklists

- [ ] Current provider documentation consulted.
- [ ] Supported instruction mechanism identified.
- [ ] Precedence/discovery caveats documented.
- [ ] Portable fallback available.
- [ ] Representative verification performed where possible.
- [ ] Actual capability health distinguished from installation/configuration presence.
- [ ] Fallback and failure behavior documented when multiple providers exist.
- [ ] Host mutations are explicitly authorized.

## Verification

Confirm the provider actually loads the intended instruction entry point and can access the referenced files in the target environment.

For provider-backed capabilities, verify at least one representative operation through the intended public interface when it is safe to do so. Do not perform irreversible actions solely to prove connectivity.

## Failure Modes

Assuming feature parity, relying on stale platform behavior, duplicating conflicting instructions, confusing documentation support with runtime compliance, treating installed metadata as healthy capability, and silently coupling the application to one volatile provider.

## Reference Files

- `references/provider-matrix.md`

## Related Capability Guidance

- `.ai/skills/capability-routing/SKILL.md`
- `.ai/templates/capability-matrix.md`

## Examples

- `examples/provider-adaptation.md`
