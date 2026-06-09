---
description: "Use when creating new reusable components in src/components. Enforce a LookupMany-like composition pattern where consumers can replace internal UI parts through typed onRender callbacks and component defaults."
applyTo: "src/components/**/*.{ts,tsx}"
---
# Reusable Component Override Rules

Apply these as hard rules when creating a new reusable component.

- For overridable components, `I<ComponentName>Props` must include `components?: Partial<I<ComponentName>Components>`.
- `I<ComponentName>Props` should be defined in the main component file (`<ComponentName>.tsx`).
- `I<ComponentName>Components` should be defined in `components/components.tsx`.
- Do not scaffold a separate `interfaces.ts` file unless explicitly requested.
- `I<ComponentName>Components` must be scaffolded as an empty interface by default.
- Do not scaffold any `onRender...` callback names unless explicitly requested.
- Store default component mappings in a dedicated `components` subfolder.
- Put default component mappings in `components/components.tsx`.
- Add `components/index.ts` that exports everything from `components/components.tsx`.
- In scaffolds, `components/components.tsx` must export an empty object placeholder (for example `export const <ComponentName>Components: I<ComponentName>Components = {};`).
- In component implementation, create a merged components object in the component body only when overridable UI is requested: `{ ...<ComponentName>Components, ...props.components }`.
- Do not scaffold render callback usage unless explicitly requested.

LookupMany pattern to follow:

- Contracts in [src/components/TaskGrid/components/grid/lookup-many/components/components.tsx](src/components/TaskGrid/components/grid/lookup-many/components/components.tsx)
- Prop and merge usage in [src/components/TaskGrid/components/grid/lookup-many/LookupMany.tsx](src/components/TaskGrid/components/grid/lookup-many/LookupMany.tsx)

Recommended baseline for each reusable component:

- `I<ComponentName>Props` with optional `components` override slot.
- `I<ComponentName>Components` empty scaffold contract (expand only when requested).
- `components/components.tsx` with an empty `<ComponentName>Components` scaffold export.
- `components/index.ts` exporting from `components.tsx`.
- Main component with merged components object available in the component body.
