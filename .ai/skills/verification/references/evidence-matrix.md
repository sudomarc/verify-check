# Evidence Matrix

Map each material requirement to the smallest meaningful evidence source.

| Claim | Evidence | Result | Scope / limitation |
|---|---|---|---|
| Behavior changed correctly | focused test or runtime check | pass/fail | tested conditions only |
| Types remain valid | type checker | pass/fail | compiler/type-system scope |
| Build is valid | build command | pass/fail | target environment assumptions |
| UI behavior works | browser/runtime inspection | observed | environment and path tested |
| Production is healthy | production telemetry/smoke test | observed | exact environment/time |

Never mark a claim verified solely because generated code looks plausible.
