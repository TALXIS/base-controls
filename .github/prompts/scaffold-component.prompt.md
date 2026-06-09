---
description: "Wrapper prompt for component scaffolding. Use the scaffold-component-skill for the canonical workflow."
argument-hint: "name=<ComponentName> overridableUi=<yes|no>"
agent: "agent"
---
Use [scaffold component skill](../skills/scaffold-component-skill/SKILL.md) as the source of truth for scaffolding behavior.

Pass through the same arguments:

- `name=<ComponentName>` (required)
- `overridableUi=<yes|no>` (required)

If an argument is missing, ask for it and then apply the workflow from the skill.
