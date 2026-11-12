# Dangerous Actions

Treat these as high-risk:

- `rm -rf` or recursive deletion;
- `git reset --hard`;
- `git clean -fd`;
- `git push --force` or equivalent history rewrite;
- branch deletion;
- production database deletion or destructive migration;
- bulk data updates without bounded predicates;
- credential rotation or revocation;
- permission broadening;
- firewall and network policy changes;
- arbitrary remote command execution;
- downloaded-script execution such as `curl ... | bash`;
- disabling security controls;
- deleting cloud resources;
- irreversible release or infrastructure operations.

Before acting, validate target, authorization, reversibility, scope, and recovery path.
