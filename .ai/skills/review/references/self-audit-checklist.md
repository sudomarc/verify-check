# Self-Audit Checklist

### Correctness
- Does the code satisfy the stated outcome?
- Are edge cases handled?
- Are failure paths explicit?
- Are state transitions valid?

### Scope
- Did only necessary files change?
- Did unrelated refactors slip in?
- Are generated files handled correctly?

### Verification
- Were focused tests run?
- Were broader checks run when risk required them?
- Was the final diff inspected after the last fix?

### Security
- Are secrets excluded?
- Are trust boundaries preserved?
- Did validation and authorization remain correct?

### Maintainability
- Does the code follow local patterns?
- Is the abstraction justified?
- Is there duplicate or dead logic?

### Delivery
- Are docs updated where behavior changed?
- Is the rollback path understood?
- Are remaining uncertainties reported?
