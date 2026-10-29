import { ServiceLocator } from "@utils";
import { IGridModule } from "../../interfaces";
import { IGridSortingComponents } from "./moduleComponents";
import { GridSorting } from "./GridSorting";
import { IGridSortingServiceMap } from "./services";

export interface ISortingModuleOptions {
    /** Overrides for the parts of what this module draws, by piece. */
    components?: IGridSortingComponents;
}

export interface ISortingModule extends IGridModule<'sorting'> { }

/** Builds the module that lets the grid be sorted. */
export const createSortingModule = (options?: ISortingModuleOptions): ISortingModule => ({
    name: 'sorting',
    onLoad: ({ services: gridServices }) => {
        //the module's own locator, with the grid's as the one key that crosses over
        const services = new ServiceLocator<IGridSortingServiceMap>();
        services.register('gridServices', () => gridServices);
        services.register('components', () => options?.components ?? {});
        return new GridSorting({ services });
    },
});
