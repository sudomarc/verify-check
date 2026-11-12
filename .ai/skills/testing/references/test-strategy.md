# Test Strategy

Use a layered model:

- unit tests for deterministic local behavior;
- integration tests for module boundaries and real dependencies;
- end-to-end tests for critical user journeys;
- static checks for syntax, types, lint, and policy.

Choose the smallest layer that reliably proves the behavior. Use broader tests when interfaces or external systems are affected.

Do not maximize test count. Maximize confidence in important behavior.
