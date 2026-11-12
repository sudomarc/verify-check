# Observation

Use this structure for an observed learning signal. Keep evidence separate from interpretation.

```yaml
id: "OBS-YYYY-NNN"
date: "YYYY-MM-DD"
category: "local|workflow|documentation|skill|provider|tooling|governance"
classification: "ONE_OFF_FAILURE|RECURRING_FAILURE|SYSTEMIC_FAILURE"
observation: ""
evidence: []
impact: ""
scope: ""
facts: []
initial_hypothesis: ""
alternative_explanations: []
confidence: "low|medium|high"
recurrence_count: 0
affected_files: []
affected_rules: []
proposal_id: null
status: "observed|investigating|proposed|resolved|rejected"
result: null
```

`confidence` describes evidence quality. It does not authorize changes. `result` is filled only after the observation is linked to a measured outcome.