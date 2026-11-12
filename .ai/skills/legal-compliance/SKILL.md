---
name: legal-compliance
description: This skill should be used when auditing an application for legal/compliance exposure around age restrictions, third-party assets or services, analytics and session replay, marketing email, subscriptions, user uploads/copyright, privacy policies, cookies/consent, and exposed secrets or user data.
---

# Legal / Compliance Audit Skill

Use this skill as an engineering audit layer, not as a substitute for legal counsel.

The goal is to locate concrete compliance-relevant behavior in the actual codebase, remediate engineering-controlled gaps, and explicitly hand off decisions that require a business owner, registration, policy update, jurisdictional analysis, or lawyer.

## Source-informed six-hole audit

The attached September 2026 source proposes six recurring checks:

1. **COPPA / age gate** — locate every account-creation and relevant unauthenticated data-collection path; enforce any required age restriction before data is stored or an account is created.
2. **Third-party font and resource loading** — locate remote font/CSS/JS loads and identify data or network disclosures; when appropriate, replace remote font loading with a repository-controlled, license-compatible asset.
3. **Session replay / analytics** — locate analytics, replay, heatmaps, keystroke or rage-click collection; default sensitive recording to off, mask inputs, document data flows, and require explicit revocable consent where the applicable regime requires it.
4. **Marketing email** — locate commercial email flows; verify unsubscribe handling, suppression checks, required sender/address information, and relevant email headers for applicable jurisdictions.
5. **Subscriptions / automatic renewal** — locate pricing, checkout, trial and cancellation flows; make applicable price and renewal terms clear at the point of purchase, obtain required affirmative consent, provide a usable cancellation path, and implement relevant confirmation/reminder flows.
6. **User uploads / copyright** — locate user-generated uploads; verify relevant reporting/takedown controls, copyright-policy surfaces and repeat-infringer handling, and identify any jurisdiction-specific registration or designated-agent step that must be completed by a human owner.

The source also asks for a secondary audit of privacy/terms links, third-party processors, cookie consent, secrets, API keys and user data exposure.

## Applicability first

Do not assume every item applies.

For each item, determine:
- what the app actually does;
- who the users are and where they are served;
- what data is collected or transmitted;
- which jurisdictions/regimes are potentially relevant;
- whether the proposed control is an engineering requirement, a policy requirement, a registration/ownership task, or a legal question.

The source explicitly warns that its figures are statutory maximums or a court ruling from named jurisdictions and that applicability depends on users and app behavior. Treat those figures as source context, never as universal liability estimates.

When current law or platform rules matter, verify against authoritative current sources before making a legal conclusion. Never turn a source checklist into a categorical statement that a law applies without jurisdictional evidence.

## Evidence-driven workflow

Use:

MAP FLOWS → CLASSIFY APPLICABILITY → TRACE DATA / EVENTS → FIX ENGINEERING GAPS → VERIFY → HAND OFF NON-CODE TASKS → REPORT

For every item:
1. Search the whole repository for relevant routes, handlers, SDKs, templates, configuration and policy surfaces.
2. Show exact evidence for where the behavior exists or where it was not found.
3. Distinguish FOUND, NOT FOUND, POTENTIALLY APPLICABLE, NOT APPLICABLE, and UNKNOWN.
4. Make the smallest coherent engineering fix when the required behavior is sufficiently established.
5. Re-run focused tests and inspect the final diff.
6. Explicitly identify what still requires human action.

## High-risk boundaries

The agent may implement code, configuration, tests and local policy wiring within the repository when authorized.

Do not silently:
- register a legal/designated agent;
- make a legal representation to regulators or users;
- invent a postal address, business identity, legal entity, contact address or retention period;
- claim a jurisdictional exemption;
- accept or reject consent language as legally sufficient without applicable evidence;
- delete compliance evidence merely to make an audit pass.

Escalate those items as YOU STILL NEED TO DO.

## Privacy and data-flow checks

When auditing third-party services, trace:
source → SDK/client → request/event → destination → data fields → consent gate → retention/control.

Do not rely on dependency names alone. Inspect initialization, event calls, configuration and network behavior.

For browser-facing applications, also check:
- tracking cookies or storage before consent where consent is required;
- consent choice persistence and revocation;
- third-party scripts and their data inputs;
- client bundles for secrets or credentials;
- logs for tokens, raw personal data or unnecessary sensitive fields.

## Legal-safe reporting

Use the exact structure:

### Item N — NAME
**Found:** ...
**Changed:** ...
**Verified:** ...
**You still need to:** ...
**Applicability:** ...
**Evidence:** ...

Then provide a summary table:

| Item | Status | Engineering change | Human/legal follow-up | Evidence |
|---|---|---|---|---|

Never report a legal item as resolved merely because code was changed. Engineering remediation and legal applicability are separate questions.

## Completion gate

An audit is complete only when all six source items and the secondary privacy/security checks are either:
- evidenced and remediated in code;
- evidenced as not applicable;
- evidenced as not found; or
- explicitly handed off with the missing decision/action stated.

This skill is an engineering control framework. It does not provide legal advice.
