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
    onRegister: gridServices => {
        const services = new ServiceLocator<IGridSelectionServiceMap>();
        const components = { ...GridSelectionComponents, ...options.components };
        services.register('gridServices', () => gridServices);
        services.register('components', () => components);
        const selection = new GridSelection({ services, mode: options.mode });
        gridServices.register('selection', () => selection);
    },
});
