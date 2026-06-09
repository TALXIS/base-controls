# AGENTS.md

This file helps AI coding agents become productive quickly in this repository.

## Scope

- Repository: @talxis/base-controls
- Tech stack: TypeScript + React component library for Power Apps Component Framework (PCF)
- Bundling: Rollup (ESM output, declaration bundling)

## First Steps

- Install dependencies: npm install
- Build library: npm run build
- Storybook local docs: npm run documentation
- Storybook static build: npm run build-documentation
- Yalc publish flow used by maintainers: npm run yalc

Important:
- No test script is defined in package.json.
- No lint script is defined in package.json.
- Prefer validating changes with npm run build and targeted type checks.

## Canonical Documentation

- Main package overview: [README.md](README.md)
- Usage patterns and extensibility: [docs/usage.md](docs/usage.md)
- Local linking and troubleshooting: [docs/developing.md](docs/developing.md)
- Release process and versioning: [docs/releasing.md](docs/releasing.md)

Link to these docs instead of duplicating their content.

## Architecture Map

- Public exports are aggregated from: [src/index.ts](src/index.ts)
- Controls live in: [src/components](src/components)
- Shared hooks live in: [src/hooks](src/hooks)
- Shared interfaces live in: [src/interfaces](src/interfaces)
- Shared utilities live in: [src/utils](src/utils)

Common control structure (example-heavy controls):
- Component entry: ControlName.tsx
- Contracts: interfaces.ts
- Styles: styles.ts
- Translations: translations.ts
- Logic extraction: useModel.ts or hooks/
- Barrel exports: index.ts

When adding or moving modules, keep barrel exports consistent so public imports from the package root continue to work.

## Build and Packaging Notes

- Rollup discovers entries via src/**/index.ts and preserves module structure in dist.
- Type declarations are bundled from dist/index.d.ts.
- Many runtime dependencies are marked external in [rollup.config.js](rollup.config.js); avoid inlining these into the bundle.
- TypeScript emits declarations to dist with strict mode enabled; keep changes type-safe.

## Coding Conventions for This Repo

- Prefer strong typing; avoid introducing any unless unavoidable.
- Use kebab-case for all newly created folder names (for example: `lookup-many`, `grid-cell-renderer`).
- Legacy folders that do not follow kebab-case can remain unchanged unless the task explicitly includes renaming/refactoring them.
- Follow existing per-control pattern: UI in component files, behavior in custom hooks/models, styling in styles.ts.
- Keep translations in dedicated translations.ts files where the control already uses that pattern.
- Avoid mutating PCF context objects directly. Use object spread to override nested behavior safely.
- Preserve existing public API shape in interfaces unless explicitly changing API behavior.

## Practical Pitfalls

- If linked local builds show React hooks runtime errors, use the React linking guidance in [docs/developing.md](docs/developing.md).
- If build output changes unexpectedly, verify barrel exports and Rollup multi-entry discovery paths first.
- Do not commit local-consumer-specific config changes from linked Portal/PCF repos.

## Change Validation Checklist

- Run npm run build
- Confirm exports are reachable from [src/index.ts](src/index.ts) and relevant nested index.ts files
- Check affected controls for translation/style/interface consistency with neighboring controls
