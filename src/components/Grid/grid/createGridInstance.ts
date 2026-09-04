import { Module, ModuleRegistry } from "@ag-grid-community/core";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@legacy";
import { LocalizationService, ServiceLocator } from "@utils";
import { IGridModule, IGridModules } from "../modules";
import { IGrid } from "../interfaces";
import { GRID_LABELS, IGridLabels } from "../labels";
import { IGridServiceLocator, IGridServiceMap } from "../services";
import { AgGridModel } from "./ag-grid/AgGridModel";
import { GridSettings } from "./settings";
import { GridTheming } from "./theming";
import { GridColumns } from "./columns";
import { GridCells } from "./cells";
import { GridColumnHeaderParts } from "./column-header";
import { GridColumnLayout } from "./column-layout";
import { GridOverlays } from "./overlays";

export interface ICreateGridInstanceParameters {
    /** The current props, read on demand so the grid follows them rather than the ones it was built with. */
    onGetProps: () => IGrid;
    /** The host context. Needed outside React, where a cell's nested control is constructed. */
    pcfContext: ComponentFramework.Context<any, any>;
    /** The control's theme. It does not change while a grid is alive. */
    theme: ITheme;
}

/** A grid, assembled. */
export interface IGridInstance {
    /** What the caller asked the grid to be, with its defaults applied. */
    settings: GridSettings;
    /** Where the grid's parts and its modules find each other. */
    services: IGridServiceLocator;
    /** What the modules say the grid has to be created with, merged. */
    initialComponentProps: Partial<AgGridReactProps<IRecord>>;
    /** Releases what the modules hold. Called before the locator goes, which is what they resolve through. */
    destroy: () => void;
}

/**
 * Assembles a grid.
 *
 * The parts that need no AG Grid are built here; the ones that *are* the grid are built when there is one,
 * which is what `whenAvailable` below is for. Nothing holds an api it might not have.
 */
export const createGridInstance = ({ onGetProps, pcfContext, theme }: ICreateGridInstanceParameters): IGridInstance => {
    const services = new ServiceLocator<IGridServiceMap>();

    //first: everything below reads the props, the provider and the strings through these, and they need
    //nothing back
    const labels = new LocalizationService<IGridLabels>({ ...GRID_LABELS, ...onGetProps().labels });
    const settings = new GridSettings({ onGetProps });
    services.register('labels', () => labels);
    services.register('settings', () => settings);
    services.register('pcfContext', () => pcfContext);
    //the one service whose resolver is the point: it runs on every lookup, so a provider handed over later
    //is the one every part reads
    services.register('provider', () => onGetProps().provider);
    //constructed, then registered: a resolver runs on every lookup, so `() => new X()` would hand out a
    //fresh instance each time - and these hold what the modules registered on them
    const theming = new GridTheming({ services, theme });
    const columns = new GridColumns({ services });
    const cells = new GridCells({ services });
    const columnHeader = new GridColumnHeaderParts({ services });
    //both wait for an api and then talk only to it, so nothing has to be registered before them - and
    //being ahead of `AgGridModel` is what puts their listeners on the grid before it pushes anything
    const columnLayout = new GridColumnLayout({ services });
    const overlays = new GridOverlays({ services });
    services.register('theming', () => theming);
    services.register('columns', () => columns);
    services.register('cells', () => cells);
    services.register('columnHeader', () => columnHeader);
    services.register('columnLayout', () => columnLayout);
    services.register('overlays', () => overlays);

    const modules = onGetProps().modules;
    assertModulesFitRowModel(modules);
    for (const module of orderModules(modules)) {
        module.onRegister?.(services);
    }
    //after the modules have had their say, and before AG Grid is constructed on this same render: a grid
    //whose row model is missing from the registry renders empty and reports a console error
    ModuleRegistry.registerModules(getAgGridModules(modules));

    //constructed eagerly, and before anything can render: it waits for the api itself, and the first thing
    //it does when one arrives is push columns - whose headers AG Grid renders, and they resolve this
    const agGrid = new AgGridModel({ services });
    services.register('agGrid', () => agGrid);

    return {
        settings,
        services,
        initialComponentProps: orderModules(modules)
            .reduce<Partial<AgGridReactProps<IRecord>>>(
                (props, module) => ({ ...props, ...module.getInitialComponentProps?.() }), {}),
        destroy: () => orderModules(modules).forEach(module => module.onDestroy?.(services)),
    };
};

/**
 * The one order modules are read in, so two grids configured the same behave the same.
 *
 * Not `Object.values`, whose order is whatever the caller happened to type: two modules setting the same
 * option would otherwise resolve differently between identical grids. The licence comes first, because the
 * key has to precede anything enterprise.
 */
const orderModules = (modules: IGridModules): IGridModule[] => [
    modules.license,
    modules.rowModel,
    modules.selection,
    modules.sorting,
    modules.filtering,
    modules.grouping,
    modules.aggregation,
    modules.clipboard,
].filter((module): module is IGridModule => !!module);

const getAgGridModules = (modules: IGridModules): Module[] =>
    orderModules(modules).flatMap(module => module.agGridModules ?? []);

/**
 * Refuses a combination where a module cannot work.
 *
 * Registering a module's AG Grid dependency is not enough to make the grid use it — `rowModelType` decides
 * that — so a module that only works on one model would otherwise render affordances that do nothing.
 */
const assertModulesFitRowModel = (modules: IGridModules): void => {
    const rowModelType = modules.rowModel.getInitialComponentProps?.()?.rowModelType;
    for (const module of orderModules(modules)) {
        if (module.requiresRowModel && module.requiresRowModel !== rowModelType) {
            throw new Error(`This grid was given a module that needs the ${module.requiresRowModel} row model, but its row model is ${rowModelType}.`);
        }
    }
};
