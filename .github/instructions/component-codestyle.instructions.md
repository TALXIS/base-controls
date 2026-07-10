---
applyTo: "src/components/**/*"
description: "Component folder and scaffolding conventions for UI components."
---

# Component codestyle

Follow these conventions when creating or restructuring components in `src/components`.

## Folder structure

- Put every component in its own folder.
- Name component folders in **kebab-case**.
- Name the main component file in **PascalCase** and match the component name.
- Add a local `index.ts` in every component folder with:

```ts
export * from './ComponentName';
```

- Use folder-level `index.ts` files as export boundaries when a subtree has multiple related components.
- Name colocated React context files `context.ts`.

## Component shape

- Name props interfaces `I<ComponentName>Props`.
- Define the props interface in the main component file by default.
- Name the component parameter `props`.
- Avoid separate `interfaces.ts` files for a component unless there is a clear reason.

## Styling

- Keep component styles in a colocated `styles.ts` file instead of inline style objects.
- Build styles with `mergeStyleSets` from `@fluentui/react`.
- Name the style factory `get<ComponentName>Styles`.
- Call the style factory inside `useMemo`.

## Overridable UI

- Only add overridable UI scaffolding when the component actually needs it.
- When used, keep the defaults in a local `components/` subfolder.
- Define `I<ComponentName>Components` in `components/components.tsx`.
- Export the defaults through `components/index.ts`.
- Merge default and user-provided component mappings in the component body.
- Do not add `onRender...` callback scaffolding unless explicitly requested.
