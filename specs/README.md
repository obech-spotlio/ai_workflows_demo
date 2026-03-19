# Specs

`ticket-planner` stores ticket specs here so the rest of the workflow can use a stable local handoff.

## Path convention

```text
specs/<functionality>/<ticket-key>.md
```

Examples:

```text
specs/payments/ABC-123.md
specs/checkout/ABC-124.md
```

## Rules

- Group tickets by stable functionality slug, not by ticket type.
- Keep functionality slugs short and filesystem-safe.
- Reuse the same functionality folder for related tickets in the same area.
- `coder`, `reviewer`, and `publisher` should read the spec before acting when it exists.
