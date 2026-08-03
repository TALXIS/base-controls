# base-controls Storybook

This package contains the standalone Storybook workspace for `@talxis/base-controls`.

## Scripts

- `npm run dev` starts Storybook on port `6006`
- `npm run build` builds the static Storybook site
- `npm run lint` runs Oxlint across the Storybook sources

## Local development

This package is intentionally separate from the main `base-controls` package, but its Storybook config resolves `@talxis/base-controls` directly to `../src/**`. That means changes in `base-controls/src` should appear in Storybook immediately during development without publishing the package first.
