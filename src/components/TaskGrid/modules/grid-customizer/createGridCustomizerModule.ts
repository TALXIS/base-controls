import { IGridCustomizerStrategy } from "@components/TaskGrid/components/grid/grid-customizer/GridCustomizer";
import { IGridCustomizerModule } from "../interfaces";

export interface IGridCustomizerModuleOptions {
    /** Hooks into the grid's core behaviour: column definitions, row class rules, one-time init. */
    strategy: IGridCustomizerStrategy;
}

/**
 * Registers a strategy that hooks into the grid's own AG Grid instance.
 *
 * Return it from the descriptor's `onGetModules` to enable it.
 *
 * ```ts
 * onGetModules: () => ({
 *     gridCustomizer: createGridCustomizerModule({ strategy: new MyGridCustomizerStrategy() }),
 * })
 * ```
 */
export const createGridCustomizerModule = (options: IGridCustomizerModuleOptions): IGridCustomizerModule => ({
    strategy: options.strategy,
});
