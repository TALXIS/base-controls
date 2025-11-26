# Developing

## Running locally build package in PCF

1. Run `npm install` inside the root directory.
1. Run `npm run build`.
1. Run `pnpm link --global`
1. Navigate to the PCF root directory
1. Run `pnpm link --global @talxis/base-controls`
1. Run `npm start watch`.

If you make any changes in the package and re-build it with `npm run build`, it will automatically re-build the PCF and show your changes.

## Running locally build package in Portal

1. Run `npm install` inside the root directory.
1. Run `npm run build`.
1. Run `npm link`.
1. Navigate to the `Portal.Web.Frontend` directory.
1. Add the following prop in the `vite.config.mts` file under `defineConfig`:

```typescript
optimizeDeps: {
    exclude: ['@talxis/base-controls']
}
```
8. Run `npm install`
9. Run `npm link @talxis/base-controls`
10. Run `npm start`

These steps only need to be done once. If you want to see any future changes you made in the package, you need to run `npm run build` in package root directory and Portal will automatically reload with your changes applied.

**Don't forget to revert the `vite.config.mts` file to the original version before pushing any changes to the Portal repo!**

## Troubleshooting

If your PCF/Portal builds, but you get an `Hooks can only be called inside of the body of a function component` error during runtime, you need to link the version of React from your PCF/Portal to the package:

1. Navigate to the root directory.
2. Run `npm` link `<path-to-react> <path-to-react-dom>`

Easiest way to do this is drag the `react` and `react-dom` folders from your PCF/Portal `node_modules` folder into the terminal window where you write the `npm link` command.

