import { ServiceLocator } from "@utils";
import { IGridModule } from "../interfaces";
import { GridRowSelection } from "./GridRowSelection";
import { IGridRowSelectionServiceMap } from "./services";
import { GridRowSelectionComponents, IGridRowSelectionComponents } from "./moduleComponents";

export interface IRowSelectionModuleOptions {
    /** How many rows may be selected at once. */
    mode: 'single' | 'multiple';
    /** Overrides for the checkbox in a row, or the one in the header. */
    components?: Partial<IGridRowSelectionComponents>;
}

/**
 * Builds the module that lets rows be selected.
 *
 * @example
 */
export const createRowSelectionModule = (options: IRowSelectionModuleOptions): IGridModule => ({
    onRegister: gridServices => {
        const services = new ServiceLocator<IGridRowSelectionServiceMap>();
        const components = { ...GridRowSelectionComponents, ...options.components };
        services.register('gridServices', () => gridServices);
        services.register('components', () => components);
        const selection = new GridRowSelection({ services, mode: options.mode });
        gridServices.register('rowSelection', () => selection);
    },
});
