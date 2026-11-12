# Coding Standards

Follow the target repository's local style first.

General rules:

- choose names that express domain intent;
- keep functions focused;
- validate at trust boundaries;
- preserve explicit error handling;
- avoid hidden global state;
- keep side effects visible;
- minimize public API changes;
- prefer deterministic behavior in tests;
- add comments for non-obvious invariants, not obvious syntax;
- remove dead code created by the change.

Do not force a universal formatter, naming style, or architectural pattern onto a repository with established conventions.
