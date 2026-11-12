# Handoff Quality

A good handoff is short enough to transfer cheaply and complete enough to prevent reconstruction.

## Required properties

- Factual: claims are grounded in observed repository state.
- Minimal: no transcript, duplicated instructions, or irrelevant history.
- Durable: decisions, failures, verification, and risks survive the reset.
- Actionable: next actions are concrete, ordered, and tied to completion criteria.
- Reconciled: the snapshot matches repository evidence at handoff time.
- Uncertainty-aware: missing verification and unresolved questions are explicit.

## Failure patterns

Reject or repair handoffs that:

- say "everything works" without evidence;
- omit material failed attempts;
- list files without describing why they matter;
- contain only a task restatement;
- include stale assumptions that contradict the repository;
- leave next actions vague ("continue", "finish", "fix it");
- claim completion instead of defining how the next session should verify it.
