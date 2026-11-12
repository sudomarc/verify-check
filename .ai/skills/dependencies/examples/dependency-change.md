# Example Dependency Change

Problem: the project needs a maintained URL parser already available for the target runtime.

Evidence: repository does not contain a parser utility and existing runtime APIs do not meet the required compatibility target.

Decision: add one focused dependency, update the lockfile through the package manager, run install, type checking, tests, and inspect the lockfile diff.
