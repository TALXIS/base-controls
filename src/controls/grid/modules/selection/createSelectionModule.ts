import { ServiceLocator } from "@utils";
import { IGridModule } from "../interfaces";
import { GridSelection } from "./GridSelection";
import { IGridSelectionServiceMap } from "./services";
import { GridSelectionComponents, IGridSelectionComponents } from "./moduleComponents";

export interface ISelectionModuleOptions {
    /** How many rows may be selected at once. */
    mode: 'single' | 'multiple';
    /** Overrides for the checkbox in a row, or the one in the header. */
    components?: Partial<IGridSelectionComponents>;
}

/**
 * Builds the module that lets rows be selected.
 *
 * @example
 */
export const createSelectionModule = (options: ISelectionModuleOptions): IGridModule => ({
    getInitialComponentProps: () => ({ rowSelection: options.mode }),
    onRegister: gridServices => {
        //the module's own locator, with the grid's as the one key that crosses over
        const services = new ServiceLocator<IGridSelectionServiceMap>();
        services.register('gridServices', () => gridServices);
        //AG Grid rebuilds a cell whose renderer identity changed, and a resolver runs per lookup
        const components = { ...GridSelectionComponents, ...options.components };
        services.register('components', () => components);
        const selection = new GridSelection({ services, mode: options.mode });
        gridServices.register('selection', () => selection);
        //ahead of the default hooks, because it is the first column.
        gridServices.get('columns').registerColumnDefinitionsHook(
            columnDefs => selection.applyColumnDefinitions(columnDefs), -1);
    },
    onDestroy: gridServices => gridServices.get('selection').destroy(),
});
