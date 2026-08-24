import { IGridCustomizerStrategy } from "@components/TaskGrid/components/grid/grid-customizer/GridCustomizer";
import { IGridCustomizerModule } from "../interfaces";

/** Options for {@link createGridCustomizerModule}. */
export interface IGridCustomizerModuleOptions {
    /** Hooks into the grid's core behaviour: column definitions, row class rules, one-time init. */
    strategy: IGridCustomizerStrategy;
}

/**
 * Builds the grid-customizer module from a strategy that hooks into the grid's own AG Grid instance.
 *
 * Assign it to a `modules` key — `modules.onGetGridCustomizerModule` on a shipped descriptor, or
 * `onGetModules` on a descriptor of your own. The grid registers it as `gridCustomizerModule`.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetGridCustomizerModule: () => createGridCustomizerModule({ strategy: new MyGridCustomizerStrategy() }),
 * }
 * ```
 */
export const createGridCustomizerModule = (options: IGridCustomizerModuleOptions): IGridCustomizerModule => ({
    strategy: options.strategy,
});
