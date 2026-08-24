import { IGridCustomizerStrategy } from "@components/TaskGrid/components/grid/grid-customizer/GridCustomizer";
import { IGridCustomizerModule } from "../interfaces";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** Options for {@link createGridCustomizerModule}. */
export interface IGridCustomizerModuleOptions {
    /** Hooks into the grid's core behaviour: column definitions, row class rules, one-time init. */
    strategy: IGridCustomizerStrategy;
}

/**
 * Builds the grid-customizer module from a strategy that hooks into the grid's own AG Grid instance.
 *
 * Assign it to a `modules` key — `modules.onGetGridCustomizerModule` on a shipped descriptor, or
 * `onGetModules` on a descriptor of your own.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetGridCustomizerModule: (services) => createGridCustomizerModule({ strategy: new MyGridCustomizerStrategy() }, services),
 * }
 * ```
 */
export const createGridCustomizerModule = (options: IGridCustomizerModuleOptions, services: ITaskGridServiceLocator): IGridCustomizerModule => {
    services.register('gridCustomizerStrategy', () => options.strategy);
    return { strategy: options.strategy };
};
