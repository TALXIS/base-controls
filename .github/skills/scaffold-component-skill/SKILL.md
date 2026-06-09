---
name: scaffold-component-skill
description: 'Scaffold a React component folder with repository conventions. Use when creating a new component with optional overridable UI contract and strict empty-default templates.'
argument-hint: 'name=<ComponentName> overridableUi=<yes|no>'
---

# Scaffold Component Skill

Scaffold a new component in a new subfolder inside the current folder using repository conventions.

## Input Format

- `name=<ComponentName>` (required, PascalCase)
- `overridableUi=<yes|no>` (required)

If one or both values are missing, ask a concise clarification question before generating files.

## Embedded Conventions

Apply these conventions directly when scaffolding.

### Structure Conventions

- Every component must have its own folder.
- New component folder names must match the component name in kebab-case (for example: `LookupMany` -> `lookup-many`).
- The main component implementation file must be named after the component in PascalCase (for example: `LookupMany.tsx`).
- Component props interface must be named `I<ComponentName>Props`.
- The props interface must be defined in the main component file (`<ComponentName>.tsx`), not in a separate `interfaces.ts` file, unless explicitly requested.
- Component function parameter must always be named `props`.
- Each component folder must include an `index.ts` file.
- `index.ts` must export the component from the component implementation file:

```ts
export * from './ComponentName';
```

Legacy note:

- Existing folders that use older naming can remain unchanged unless the task explicitly includes renaming/refactoring.

### Styling Conventions

- Keep component styling in a separate `styles.ts` file colocated with the component.
- Do not define style objects inline in component `.tsx` files unless there is a temporary debugging reason.
- In `styles.ts`, build styles with `mergeStyleSets` from `@fluentui/react`.
- Export a styles factory function named `get<ComponentName>Styles`.
- The function must end with `Styles` and include the component name.
- For newly scaffolded components, style factory output must be exactly `{ root: {} }` unless explicitly requested otherwise.
- In component `.tsx` files, call style factory functions inside `useMemo`.

### Overridable UI Conventions

- Apply only when `overridableUi=yes`.
- `I<ComponentName>Props` must include `components?: Partial<I<ComponentName>Components>`.
- `I<ComponentName>Components` must be scaffolded as an empty interface by default.
- `I<ComponentName>Components` should be defined in `components/components.tsx`.
- Do not scaffold a separate `interfaces.ts` file unless explicitly requested.
- Do not scaffold any `onRender...` callback names unless explicitly requested.
- Store default component mappings in a dedicated `components` subfolder.
- Put default component mappings in `components/components.tsx`.
- Add `components/index.ts` that exports everything from `components/components.tsx`.
- In scaffolds, `components/components.tsx` must export an empty object placeholder:

```ts
export const <ComponentName>Components: I<ComponentName>Components = {};
```

- In component implementation, create a merged components object in the component body only when overridable UI is requested:

```ts
const components = { ...<ComponentName>Components, ...props.components };
```

- Do not scaffold render callback usage unless explicitly requested.

## Implementation Requirements

- Create a new component folder inside the current folder.
- Name the new folder in kebab-case derived from `name`.
- Create files using the canonical templates below.
- Keep strong typing and avoid introducing `any` unless unavoidable.
- Do not scaffold fake/example business props or behavior.

## Canonical Templates

Use these templates as source of truth for generated code.

### Template A: `overridableUi=no`

Folder structure:

```text
<component-folder>/
  <ComponentName>.tsx
  styles.ts
  index.ts
```

`<ComponentName>.tsx`

```ts
import React, { useMemo } from 'react';
import { useTheme } from '@fluentui/react';
import { get<ComponentName>Styles } from './styles';

export interface I<ComponentName>Props {}

export const <ComponentName> = (props: I<ComponentName>Props) => {
	const theme = useTheme();
	const styles = useMemo(() => get<ComponentName>Styles(theme), [theme]);

	return <div className={styles.root} />;
};
```

`styles.ts`

```ts
import { ITheme, mergeStyleSets } from '@fluentui/react';

export const get<ComponentName>Styles = (theme: ITheme) => {
	return mergeStyleSets({
		root: {},
	});
};
```

`index.ts`

```ts
export * from './<ComponentName>';
```

Use the same `index.ts` export pattern for all scaffolded component folders.

## Conditional Requirements

When `overridableUi=yes`:

- Add `components` subfolder and use Template B.
- Do not scaffold `onRender...` callback names or render payload objects unless explicitly requested.

### Template B: `overridableUi=yes`

Folder structure:

```text
<component-folder>/
  <ComponentName>.tsx
  styles.ts
  index.ts
  components/
	components.tsx
	index.ts
```

`<ComponentName>.tsx`

```ts
import React, { useMemo } from 'react';
import { useTheme } from '@fluentui/react';
import { <ComponentName>Components, I<ComponentName>Components } from './components';
import { get<ComponentName>Styles } from './styles';

export interface I<ComponentName>Props {
	components?: Partial<I<ComponentName>Components>;
}

export const <ComponentName> = (props: I<ComponentName>Props) => {
	const theme = useTheme();
	const styles = useMemo(() => get<ComponentName>Styles(theme), [theme]);
	const components = { ...<ComponentName>Components, ...props.components };

	return <div className={styles.root} />;
};
```

`components/components.tsx`

```ts
export interface I<ComponentName>Components {}

export const <ComponentName>Components: I<ComponentName>Components = {};
```

`components/index.ts`

```ts
export * from './components';
```

## Output Format

1. Brief summary of generated structure.
2. List of created/updated files.
3. Any assumptions made.
4. Validation steps performed (for example: `npm run build`).
