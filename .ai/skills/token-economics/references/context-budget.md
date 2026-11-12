# Context Budget Reference

## Objective

Minimize low-value context, not context indiscriminately.

## Context layers

1. Stable policy
2. Stable project facts
3. Task-specific requirements
4. Current repository state
5. Tool results
6. Temporary reasoning / hypotheses

Keep higher-reuse layers stable when caching is available. Keep high-churn material late in the prompt/context where practical.

## Retrieval ladder

Use:

tree/list → search → targeted lines → related tests/docs → full file

Escalate only when the narrower level cannot answer the current question.

## Compaction trigger

Consider compaction when:

- context approaches the host/provider budget;
- the active task has accumulated several completed investigation branches;
- tool outputs dominate recent history;
- old hypotheses are superseded;
- the next decision no longer requires most of the historical transcript.

## Preserve during compaction

- objective and completion criteria;
- exact paths and symbols;
- accepted architectural decisions;
- current failures;
- successful verification commands/results;
- remaining risks;
- pending decisions;
- next concrete action.

## Discard or re-retrieve

Usually discard:

- repeated file contents;
- duplicate search results;
- long logs after the relevant error is extracted;
- abandoned hypotheses;
- conversational filler;
- tool results no longer needed for the next decision.

Source of approach: Anthropic context-engineering guidance and trajectory-reduction research. Verify implementation details against the current host/provider documentation.
