# Tool Economics Reference

## Principle

The model should receive the smallest tool result that can support the next decision.

## Prefer

- exact path queries;
- symbol search;
- line-bounded reads;
- server-side filters;
- pagination;
- aggregation;
- concise result modes;
- programmatic batching when many intermediate results do not need model inspection.

## Avoid

- whole repository dumps;
- whole logs when one failure is needed;
- repeated identical searches;
- returning secrets or irrelevant metadata;
- making the model inspect data that the tool could filter itself.

## Tool result contract

A useful tool should define:

- input scope;
- bounded output behavior;
- pagination/truncation semantics;
- failure semantics;
- whether results may be stale;
- whether repeated calls are expected.

## Programmatic calls

Use programmatic/batched tool calls when many independent calls can be executed and filtered before returning results to the model.

Do not use them merely for one or two sequential calls where orchestration overhead outweighs the benefit.

## Verification

Do not hide evidence needed to verify a result. Cost reduction is not permission to remove decisive diagnostics.
