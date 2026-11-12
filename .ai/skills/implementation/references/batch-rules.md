# Batch Rules

A batch is one coherent logical change that can be inspected and verified independently.

Prefer fewer than 50 changed lines per batch. Exceed the heuristic when an atomic generated file, schema migration, or mechanically coupled change would become less safe if split.

Every batch must have:

1. a stated purpose;
2. explicit files or modules;
3. a stop condition;
4. a verification command or inspection method;
5. a result record.

Do not combine refactoring, formatting, dependency upgrades, and feature work in one batch unless their coupling is unavoidable and documented.
