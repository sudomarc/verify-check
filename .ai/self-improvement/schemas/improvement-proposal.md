# Improvement Proposal

Every proposal must be reviewable without reconstructing the agent's reasoning from hidden state.

```yaml
id: "IMP-YYYY-NNN"
observation_ids: []
category: "local|workflow|documentation|skill|provider|tooling|governance"
classification: "ONE_OFF_FAILURE|RECURRING_FAILURE|SYSTEMIC_FAILURE"
problem: ""
evidence: []
frequency: ""
root_cause_hypothesis: ""
alternative_explanations: []
affected_files: []
affected_rules: []
change_type: "ADD|REMOVE|MERGE|SIMPLIFY|REPLACE|MODIFY"
proposed_change: ""
expected_benefit: ""
risks: []
regression_risks: []
validation_plan: []
confidence: "low|medium|high"
approval_required: false
approval_reason: null
status: "proposed|approved|rejected|applied|reverted"
result: null
```

Approval rules are enforced by `.ai/self-improvement/rules.md`. Confidence is evidence quality, never authorization.