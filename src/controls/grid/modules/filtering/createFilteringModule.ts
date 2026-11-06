import { ServiceLocator } from "@core";
import { IGridModule } from "../../interfaces";
import { GridFiltering } from "./GridFiltering";
import { IGridFilteringServiceMap } from "./runtime";
import { IGridFilteringComponents } from "./components";

export interface IFilteringModuleParameters {
    /** Overrides for the parts of what this module draws, by piece. */
    components?: IGridFilteringComponents;
}

export interface IFilteringModule extends IGridModule<'filtering'> { }

/** Builds the module that lets the grid be filtered. */
export const createFilteringModule = (parameters?: IFilteringModuleParameters): IFilteringModule => ({
    name: 'filtering',
    onLoad: ({ services: gridServices }) => {
        const services = new ServiceLocator<IGridFilteringServiceMap>();
        services.register('gridServices', () => gridServices);
        services.register('components', () => parameters?.components ?? {});
        return new GridFiltering({ services });
    },
});
