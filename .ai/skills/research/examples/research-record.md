# Example Research Record

Question: How should a Claude Code skill expose its trigger and bundled references?

Sources: Anthropic public Claude Code skill-development guidance and public skills repository.

Observed: `SKILL.md` uses YAML metadata including `name` and `description`; detailed material can live in references; examples and scripts can be bundled.

Decision: keep trigger metadata precise and move deep procedural detail into references.
