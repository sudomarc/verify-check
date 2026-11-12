# Diff Review Guide

Read the diff as a narrative of intent.

First review the changed-file list. Then inspect each hunk. Look for changes that do not support the plan. Check adjacent code where behavior crosses boundaries.

Review for:

- incorrect assumptions;
- missing error handling;
- race conditions;
- null and boundary cases;
- security issues;
- test gaps;
- compatibility breaks;
- accidental formatting churn;
- dead code;
- misleading comments;
- unnecessary complexity.

Prefer high-confidence actionable findings. When no issues are found, state what was reviewed and what verification supports the conclusion.
