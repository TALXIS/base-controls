---
description: "Use when creating or moving components in src/components. Enforce component folder naming, required index.ts barrel export, and component file naming conventions."
applyTo: "src/components/**/*.{ts,tsx}"
---
# Component Structure Rules

Apply these as hard rules when creating a new component.

- Every component must have its own folder.
- New component folder names must match the component name in kebab-case (for example: `LookupMany` -> `lookup-many`).
- The main component implementation file must be named after the component in PascalCase (for example: `LookupMany.tsx`).
- Component props interface must be named `I<ComponentName>Props`.
- The props interface must be defined in the main component file (`<ComponentName>.tsx`), not in a separate `interfaces.ts` file, unless explicitly requested.

- Component function parameter must always be named `props`
- Each component folder must include an `index.ts` file.
- `index.ts` must export the component from the component implementation file.

Required export pattern:

```ts
export * from './ComponentName';
```

Legacy note:

- Existing folders that use older naming can remain unchanged unless the task explicitly includes renaming/refactoring.
