# Running the controls in local PCF harness

1. Run `npm install` inside the root directory.
1. Navigate to `examples` folder which contains a PCF wrapper for each Base Control.
1. Navigate to the desired control folder and run `npm install` again.
1. Run `npm start watch`. This will open the local PCF harness. If you make any changes in the Base Control being used by the wrapper, it will automatically re-build the PCF and show your changes.

# Running the controls in Portal

1. Navigate to the root directory.
1. Run `npm install`.
1. Run `npm run build`.
1. Run `npm link`.
1. Go to `Portal.Web.Frontend` directory.
1. Add the following prop in the `vite.config.mts` file under `defineConfig`:

```typescript
optimizeDeps: {
    exclude: ['@talxis/base-controls']
}
```
7. Delete `node_modules`
8. Run `npm install`
9. Run `npm link @talxis/base-controls`
10. Run `npm start`

These steps only need to be done once. If you want to see any future changes you made in Base Control package, you need to run `npm run build` in Base Control root directory and Portal will automatically reload with your changes applied.

**Don't forget to revert the `vite.config.mts` file to the original version before pushing any changes to the Portal repo!**

> **_NOTE:_**  If Portal starts to complain that there is a mismatch in React versions, you need to delete the `react` and `react-dom` packages from the `node_modules` folder in Base Controls

