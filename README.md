# Building the components locally

1. Run `npm install` inside the root directory.
1. Run `npm run sandbox`. This will run the sandbox environment located in `src/sandbox`,
where you can import and test all of the components (the source code for all components is located in `src/components`).
1. Optionally, you can run `npm run documentation` to view the current documentation for existing components and use it for testing purposes.

# Testing the components locally in Portal

1. Run `npm i yalc -g` (only needed once)
1. Navigate to the shared components root directory.
1. Run `npm run build`.
1. Run `yalc publish`.
1. Go to the Portal.Web.Frontend directory and run `yalc add @talxis/react-components`. This will replace the NPM package in `package.json` with the locally built version.
1. Run the Portal.

If you want to see the latest changes applied, repeat steps 2 and 3 and run `yalc update` in the `Portal.Web.Frontend` directory.
**Don't forget to revert the `package.json` file to the original version before pushing any changes to the Portal repo!**
