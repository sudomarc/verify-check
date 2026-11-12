# Learning Record

Use this structure for a bounded learning record that can be audited across cycles.

```yaml
id: "LR-YYYY-NNN"
date: "YYYY-MM-DD"
category: "local|workflow|documentation|skill|provider|tooling|governance"
classification: "ONE_OFF_FAILURE|RECURRING_FAILURE|SYSTEMIC_FAILURE"
observation: ""
evidence: []
user_feedback: []
impact: ""
scope: ""
facts: []
root_cause_hypothesis: ""
alternative_explanations: []
confidence: "low|medium|high"
recurrence_count: 0
affected_guidance: []
affected_files: []
proposal_id: null
status: "observed|investigating|proposed|resolved|rejected"
result: null
```

Record facts and evidence first. User feedback is evidence when explicitly available; it is not a license to weaken governance. Do not store secrets or unnecessary personal information.