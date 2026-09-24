import { Module, ModuleRegistry } from "@ag-grid-community/core";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { LocalizationService, ServiceLocator } from "@utils";
import { IGridModule, IGridModules } from "./modules";
import { IGrid } from "./interfaces";
import { GRID_LABELS, IGridLabels } from "./labels";
import { IGridServiceLocator, IGridServiceMap } from "./services";
import { AgGridModel } from "./services/ag-grid/AgGridModel";
import { GridSettings, IGridSettings } from "./services/settings";
import { GridRows } from "./services/rows";
import { GridColumns } from "./services/columns";
import { GridCells } from "./services/cells";
import { GridKeyboard } from "./services/keyboard";
import { GridColumnHeaders } from "./services/column-header";
import { GridColumnLayout } from "./services/column-layout";
import { GridOverlays } from "./services/overlays";
import { GridSurfaces } from "./services/surfaces";

export interface ICreateGridInstanceParameters {
    /** The current props, read on demand so the grid follows them. */
    onGetProps: () => IGrid;
    /** The host context. */
    pcfContext: ComponentFramework.Context<any, any>;
    /** The control's theme. */
    theme: ITheme;
}

/** A grid, assembled. */
export interface IGridInstance {
    /** What the caller asked the grid to be, with its defaults applied. */
    settings: IGridSettings;
    /** Where the grid's parts and its modules find each other. */
    services: IGridServiceLocator;
    /** What the modules say the grid has to be created with, merged. */
    initialComponentProps: Partial<AgGridReactProps<IRecord>>;
    /** Releases what the modules and the grid's own parts hold. */
    destroy: () => void;
}

/** Assembles a grid. */
export const createGridInstance = ({ onGetProps, pcfContext, theme }: ICreateGridInstanceParameters): IGridInstance => {
    const services = new ServiceLocator<IGridServiceMap>();

    //first: everything below reads the props and the provider through these
    const labels = new LocalizationService<IGridLabels>({ ...GRID_LABELS, ...onGetProps().labels });
    const settings = new GridSettings({ onGetProps });
    services.register('labels', () => labels);
    services.register('settings', () => settings);
    services.register('pcfContext', () => pcfContext);
    //the one service whose resolver is the point
    services.register('provider', () => onGetProps().provider);
    services.register('theme', () => theme);
    //constructed, then registered: a resolver runs on every lookup
    const columns = new GridColumns({ services });
    const cells = new GridCells({ services });
    const rows = new GridRows({ services });
    const keyboard = new GridKeyboard({ services });
    const columnHeaders = new GridColumnHeaders({ services });
    const surfaces = new GridSurfaces({ services });
    //both wait for an api and then talk only to it
    new GridColumnLayout({ services });
    new GridOverlays({ services });
    services.register('columns', () => columns);
    services.register('cells', () => cells);
    services.register('rows', () => rows);
    services.register('keyboard', () => keyboard);
    services.register('columnHeaders', () => columnHeaders);
    services.register('surfaces', () => surfaces);

    const modules = onGetProps().modules;
    for (const module of orderModules(modules)) {
        module.onRegister?.(services);
    }
    //after the modules have had their say, and before AG Grid is constructed on this same render
    ModuleRegistry.registerModules(getAgGridModules(modules));

    //constructed eagerly, and before anything can render
    const agGrid = new AgGridModel({ services });
    services.register('agGrid', () => agGrid);

    return {
        settings,
        services,
        initialComponentProps: orderModules(modules)
            .reduce<Partial<AgGridReactProps<IRecord>>>(
                (props, module) => ({ ...props, ...module.getInitialComponentProps?.() }), {}),
        destroy: () => {
            orderModules(modules).forEach(module => module.onDestroy?.(services));
            keyboard.destroy();
        },
    };
};

/** The one order modules are read in, so two grids configured the same behave the same. */
const orderModules = (modules: IGridModules): IGridModule[] => [
    modules.license,
    modules.rowModel,
    modules.selection,
    modules.cellSelection,
    modules.sorting,
    modules.filtering,
    modules.grouping,
    modules.aggregation,
    modules.clipboard,
].filter((module): module is IGridModule => !!module);

const getAgGridModules = (modules: IGridModules): Module[] =>
    orderModules(modules).flatMap(module => module.agGridModules ?? []);
