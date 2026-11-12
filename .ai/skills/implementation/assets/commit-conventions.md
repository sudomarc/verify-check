# Commit Convention Examples

This file contains examples, not permission. The repository still requires explicit authorization before creating commits.

## Conventional types

Use a concise imperative subject, for example:

```text
feat: add health endpoint
fix: handle missing configuration file
refactor: simplify request validation
perf: avoid repeated config parsing
test: cover expired session behavior
docs: explain local setup
build: update toolchain configuration
ci: run tests on pull requests
chore: refresh development tooling
```

## Scope

Use a scope only when it improves clarity:

```text
feat(api): add health endpoint
fix(auth): reject expired tokens
```

## Body

Add a body when context or migration detail matters:

```text
fix(api): preserve upstream error status

Map upstream 429 responses to the public rate-limit contract while
preserving a generic message for clients.
```

## Good subject properties

- imperative;
- concrete;
- narrow;
- free of implementation trivia;
- no unnecessary punctuation.

## Bad examples

```text
stuff
changes
final
fix bug
update everything
```

These messages provide little review or history value.

## Verification note

Commit messages should describe the change, not claim tests passed unless that is actually known from the current work.
