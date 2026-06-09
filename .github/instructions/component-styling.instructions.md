---
description: "Use when creating or editing React controls/components in src/components. Enforce keeping styling in a separate styles.ts file using mergeStyleSets and an exported get<ComponentName>Styles function."
applyTo: "src/components/**/*.{ts,tsx}"
---
# Component Styling Rules

Apply these as hard rules for component work in this repository.

- Keep component styling in a separate `styles.ts` file colocated with the component.
- Do not define style objects inline in component `.tsx` files unless there is a temporary debugging reason.
- In `styles.ts`, build styles with `mergeStyleSets` from `@fluentui/react`.
- Export a styles factory function named `get<ComponentName>Styles`.
- The function must end with `Styles` and include the component name.
- For newly scaffolded components, style factory output must be exactly a `root` slot with an empty object (`{ root: {} }`) unless explicitly requested otherwise.
- In component `.tsx` files, call style factory functions inside `useMemo` (for example: `const styles = useMemo(() => get<ComponentName>Styles(...), [...deps])`).

Examples:

- `getLookupStyles`
- `getGridCellRendererStyles`
- `getDateTimeStyles`

When editing an older component that does not follow these rules:

- Prefer migrating styles into `styles.ts` as part of the change when scope allows.
- If full migration is out of scope, keep any new styling in `styles.ts` and avoid adding new inline style debt.
