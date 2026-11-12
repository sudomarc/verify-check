# Provider-neutral Agent Catalog

Provider-neutral agent profiles for coding and specialist review. Hosts can map these profiles to native primary-agent and subagent systems.

Runtime role contracts for CHAD live in docs/agent-runtime-contract.md; this catalog is for engineering-agent profiles and must not be confused with the CHAD runtime implementation.

## Kinds

- primary: owns a user-facing workflow or final integration.
- subagent: performs a bounded specialist task.
- reviewer: read-oriented specialist focused on evidence-backed findings.

## Primary agents

- web-architect
- design-director
- frontend-builder
- web-quality-orchestrator

## Specialist agents

- web-project-auditor
- token-economics-reviewer

- ui-reviewer
- anti-vibe-reviewer
- creative-art-director
- visual-reference-researcher
- creative-interaction-designer
- product-ux-specialist
- legal-compliance-reviewer
- responsive-reviewer
- accessibility-reviewer
- visual-qa
- visual-regression-reviewer
- performance-auditor
- motion-3d-specialist
- asset-pipeline-specialist
- seo-auditor
- web-security-reviewer
- nextjs-specialist
- forms-ux-reviewer
- component-reviewer
- browser-tester

## Creative Design Mode

For distinctive public web design or substantial visual redesign, require at least 5 independent pre-implementation roles: design/art direction, visual reference research, product UX, creative interaction design, and anti-vibe critique. Produce 3+ directions and a design brief before implementation. After implementation, run visual-qa and risk-based reviewers.

## Default pipeline

REQUEST → DESIGN DIRECTION → ARCHITECTURE → IMPLEMENT → BROWSER VERIFY → SPECIALIST REVIEW → INTEGRATE → FINAL DIFF

## High-value routing

- Substantial visual redesign: design-director + creative-art-director + visual-reference-researcher + product-ux-specialist + creative-interaction-designer + anti-vibe-reviewer before implementation; then ui-reviewer + visual-qa + risk-based reviewers
- Compliance-sensitive flows: legal-compliance-reviewer + relevant technical reviewer
- Advanced animation or 3D: motion-3d-specialist + visual-qa + performance-auditor
- Asset-heavy interface: asset-pipeline-specialist + performance-auditor
- Screenshot baseline or regression: visual-regression-reviewer + browser-tester
- Responsive work: responsive-reviewer + visual-qa
- Accessibility-sensitive UI: accessibility-reviewer
- Forms/auth: forms-ux-reviewer + accessibility-reviewer + browser-tester
- Next.js rendering/cache: nextjs-specialist + performance-auditor
- New public web project / launch readiness: web-project-auditor + relevant specialist reviews
- Public pages: seo-auditor + performance-auditor
- Browser trust boundary: web-security-reviewer

Do not invoke every specialist by default. Route by changed surface and risk.

## Agentic ecosystem roles

The framework also defines runtime-neutral role contracts used by the CHAD ecosystem:

- orchestrator (`.ai/contracts/orchestrator.contract.md`)
- researcher (`.ai/contracts/researcher.contract.md`)
- coder (`.ai/contracts/coder.contract.md`)
- analyst (`.ai/contracts/analyst.contract.md`)

See `.ai/contracts/README.md` and `docs/agent-runtime-contract.md`. These contracts define responsibilities, evidence, permission levels, and stop conditions without coupling the framework to a particular model or runtime.