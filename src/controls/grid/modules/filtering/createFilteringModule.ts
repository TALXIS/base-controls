import { ServiceLocator } from "@utils";
import { IGridModule } from "../../interfaces";
import { GridFiltering } from "./GridFiltering";
import { IGridFilteringServiceMap } from "./services";
import { IGridFilteringComponents } from "./moduleComponents";

export interface IFilteringModuleOptions {
    /** Overrides for the parts of what this module draws, by piece. */
    components?: IGridFilteringComponents;
}

export interface IFilteringModule extends IGridModule<'filtering'> { }

/** Builds the module that lets the grid be filtered. */
export const createFilteringModule = (options?: IFilteringModuleOptions): IFilteringModule => ({
    name: 'filtering',
    onLoad: ({ services: gridServices }) => {
        const services = new ServiceLocator<IGridFilteringServiceMap>();
        services.register('gridServices', () => gridServices);
        services.register('components', () => options?.components ?? {});
        return new GridFiltering({ services });
    },
});
