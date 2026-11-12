# Example Runbook

## Symptom
Queue processing lag exceeds the normal threshold.

## First checks
Inspect worker health, queue depth, recent deploys, and error rate.

## Safe action
Pause the rollout or scale within documented limits before changing application logic.

## Recovery
Follow the existing rollback procedure and confirm queue depth returns to baseline.
