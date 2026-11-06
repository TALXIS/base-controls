import { ServiceRegistry } from "@core";
import { IGridModule } from "../../interfaces";
import { IGridSortingComponents } from "./components";
import { GridSorting } from "./GridSorting";
import { IGridSortingServiceMap } from "./runtime";

export interface ISortingModuleParameters {
    /** Overrides for the parts of what this module draws, by piece. */
    components?: IGridSortingComponents;
}

export interface ISortingModule extends IGridModule<'sorting'> { }

/** Builds the module that lets the grid be sorted. */
export const createSortingModule = (parameters?: ISortingModuleParameters): ISortingModule => ({
    name: 'sorting',
    onLoad: ({ services: gridServices }) => {
        //the module's own locator, with the grid's as the one key that crosses over
        const services = new ServiceRegistry<IGridSortingServiceMap>();
        services.provide('gridServices', gridServices);
        services.provide('components', parameters?.components ?? {});
        return new GridSorting({ services });
    },
});
