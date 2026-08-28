import { IGridCustomizerStrategy } from "@components/TaskGrid/components/grid/grid-customizer/GridCustomizer";
import { IGridCustomizerModule } from "../interfaces";

/** Options for {@link createGridCustomizerModule}. */
export interface IGridCustomizerModuleOptions {
    /**
     * Hooks into the grid's column definitions and row class rules.
     *
     * Typed loosely on purpose: both hooks are optional, so a strategy that does all its work in its
     * constructor implements neither — and TypeScript refuses to assign a class with members of its own
     * to an all-optional interface. The grid still only ever calls the two hooks.
     */
    strategy: IGridCustomizerStrategy | any;
}

/**
 * Builds the grid-customizer module from a strategy that hooks into the grid's own AG Grid instance.
 *
 * Assign it to a `modules` key — `modules.onGetGridCustomizerModule` on a shipped descriptor, or
 * `onGetModules` on a descriptor of your own. The grid registers it as `gridCustomizerModule`.
 *
 * The strategy takes the locator itself, like every other module's, and reaches the grid through the
 * `gridCustomizer` and `gridApi` services.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetGridCustomizerModule: ({ services }) => createGridCustomizerModule({
 *         strategy: new MyGridCustomizerStrategy({ services }),
 *     }),
 * }
 * ```
 */
export const createGridCustomizerModule = (options: IGridCustomizerModuleOptions): IGridCustomizerModule => ({
    strategy: options.strategy,
});
