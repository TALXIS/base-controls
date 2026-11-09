import { IPcfContext } from "@pcf/interfaces";
import { ColDef, ColumnApiModule, ColumnAutoSizeModule, EventApiModule, GetRowIdParams, GridReadyEvent, GridStateModule, ManagedGridOptionKey, ManagedGridOptions, ModuleRegistry, RenderApiModule, RowApiModule, RowAutoHeightModule, RowStyleModule, ScrollApiModule } from "ag-grid-community";
import { AgGridReactProps } from "ag-grid-react";
import { EventEmitter, IDataProvider, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { HookRegistry, IStateStore, ModuleLoader, RuntimeLifecycle, ServiceRegistry } from "@core";
import { ILabels, ILabelSet, Labels, LabelsService } from "@labels";
import { RowLoading } from "../../adapters/rows/loading";
import { LoadingOverlay } from "../../adapters/overlays/loading";
import { EmptyStateOverlay } from "../../adapters/overlays/empty-state";
import type { IDatasetControlInternal } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import { IGridProps, IGridModuleLocator, IGridModuleMap, IGridOpenRecordParameters } from "../../interfaces";
import { IGridServiceRegistryInternal, IGridServiceMapInternal } from "../interfaces";
import { IGrid, IGridEvents } from "./interfaces";
import { GridSettings } from "../settings";
import { GridRows } from "../rows";
import { GridValidation } from "../validation";
import { GridColumns } from "../columns";
import { GridCells } from "../cells";
import { GridFields } from "../fields";
import { GridKeyboard } from "../keyboard";
import { GridColumnLayout } from "../column-layout";
import { GridOverlays } from "../overlays";
import { GridSurfaces } from "../surfaces";
import { GridTheme } from "../theme";
import { GridViewport } from "../viewport";

/** The AG Grid modules every grid needs, whichever modules it runs. */
const RUNTIME_AG_GRID_MODULES = [EventApiModule, RowApiModule, ColumnApiModule, ScrollApiModule, RenderApiModule, GridStateModule, ColumnAutoSizeModule, RowAutoHeightModule, RowStyleModule];

/** What AG Grid reads once, when it is created. */
export interface IGridAgGridInitialOptions {
    //plus the managed keys AG Grid needs before it hands over an api
    options: Omit<AgGridReactProps<IRecord>, ManagedGridOptionKey> & Pick<AgGridReactProps<IRecord>, 'rowHeight' | 'onGridReady' | 'onGridPreDestroyed'>;
}

/** What AG Grid can be handed at any time. */
export interface IGridAgGridOptions {
    options: ManagedGridOptions<IRecord>;
}

/** A hook over the options AG Grid reads only once, when it is created. */
export type GridAgGridInitialOptionsHook = (result: IGridAgGridInitialOptions) => void;

/** A hook over the options AG Grid can be handed at any time. */
export type GridAgGridOptionsHook = (result: IGridAgGridOptions) => void;

/** A record the grid is about to open; a hook that opens it itself sets `isHandled`. */
export interface IGridOpenRecordRequest extends IGridOpenRecordParameters {
    isHandled: boolean;
}

/** Opens a record in place of the provider, by setting `isHandled`. */
export type GridOpenRecordHook = (request: IGridOpenRecordRequest) => void;

export interface IGridRuntimeParameters {
    /** The current props, read on demand so the grid follows them. */
    getProps: () => IGridProps;
    /** Where the records, the columns and the paging come from. */
    provider: IDataProvider;
    /** The host context. */
    pcfContext: IPcfContext;
    /** The control's theme. */
    theme: ITheme;
    /** The grid's own entry in the state store. */
    state: IStateStore;
    /** The DatasetControl the grid is inside, if any. */
    datasetControl?: IDatasetControlInternal;
    /** Resolves the strings the grid and its modules render. */
    getLabelsService: () => LabelsService;
}

export class GridRuntime implements IGrid {
    public readonly lifecycle = new RuntimeLifecycle({
        onInit: () => this._init(),
        onDestroy: () => this._destroy(),
    });
    private _services = new ServiceRegistry<IGridServiceMapInternal>();
    private _moduleLoader = new ModuleLoader<IGridModuleMap, IGrid>();
    private _getProps: () => IGridProps;
    public readonly hooks = {
        agGridInitialOptions: new HookRegistry<GridAgGridInitialOptionsHook>(),
        agGridOptions: new HookRegistry<GridAgGridOptionsHook>(),
        openRecord: new HookRegistry<GridOpenRecordHook>(),
    };
    private _agGridProps?: IGridAgGridInitialOptions['options'];
    /** What AG Grid was last handed. */
    private _appliedAgGridOptions: ManagedGridOptions<IRecord> = {};
    private _removeGridApi?: () => void;
    private _columnDefs?: ColDef<IRecord>[];
    public readonly events: IEventEmitter<IGridEvents> = new EventEmitter<IGridEvents>();

    constructor({ getProps, provider, pcfContext, theme, state, datasetControl, getLabelsService }: IGridRuntimeParameters) {
        this._getProps = getProps;
        this._services.provide('grid', this);
        //first api listener so the others find the options applied
        this._services.observe('gridApi', () => this.refreshAgGridOptions());

        //everything below reads the props and the provider through these
        const settings = new GridSettings({ getProps, datasetControl });
        this._services.provide('labels', { getLabels: set => getLabelsService().getLabels(set) });
        this._services.provide('settings', settings);
        this._services.provide('state', state);
        this._services.provide('pcfContext', pcfContext);
        this._services.provide('provider', provider);
        this._services.provide('theme', theme);
        const gridTheme = new GridTheme({ theme, rowHeight: settings.getDefaultRowHeight() });
        this._services.provide('gridTheme', gridTheme);
        //constructed once since a resolver runs on every lookup
        const columns = new GridColumns({ services: this._services });
        const cells = new GridCells({ services: this._services });
        const rows = new GridRows({ services: this._services });
        const validation = new GridValidation({ services: this._services });
        const keyboard = new GridKeyboard({ services: this._services });
        const surfaces = new GridSurfaces();
        const fields = new GridFields({ services: this._services });
        //all three wire themselves to the api and the provider
        new GridColumnLayout({ services: this._services });
        new GridOverlays({ services: this._services });
        const viewport = new GridViewport({ services: this._services });
        this._services.provide('columns', columns);
        this._services.provide('cells', cells);
        this._services.provide('rows', rows);
        this._services.provide('validation', validation, { onDestroy: () => validation.destroy() });
        this._services.provide('keyboard', keyboard);
        this._services.provide('surfaces', surfaces);
        this._services.provide('fields', fields);
        this._services.provide('viewport', viewport);

    }

    public get services(): IGridServiceRegistryInternal {
        return this._services;
    }

    public get modules(): IGridModuleLocator {
        return this._moduleLoader.modules;
    }

    public getLabels<T extends Labels>(set: ILabelSet<T>): ILabels<T> {
        return this._services.get('labels').getLabels(set);
    }

    public refreshAgGridOptions(): void {
        const gridApi = this._services.find('gridApi');
        if (!gridApi) {
            return;
        }
        const next = this._evaluateAgGridOptions();
        const previous = this._appliedAgGridOptions;
        //in the order the hooks wrote them
        const keys = new Set([...Object.keys(next), ...Object.keys(previous)] as ManagedGridOptionKey[]);
        for (const key of keys) {
            if (next[key] !== previous[key]) {
                gridApi.setGridOption(key, next[key]);
            }
        }
        this._appliedAgGridOptions = next;
    }

    /** The props AG Grid is created with, after the hooks. */
    public getAgGridProps(): AgGridReactProps<IRecord> {
        //later options reach AG Grid through `refreshAgGridOptions`
        this._agGridProps ??= this._evaluateAgGridInitialOptions();
        return this._agGridProps;
    }

    public openRecord(parameters: IGridOpenRecordParameters): void {
        const request: IGridOpenRecordRequest = { ...parameters, isHandled: false };
        this.hooks.openRecord.apply(request);
        if (request.isHandled) {
            return;
        }
        //a grouped row's provider has none of the root's interceptors
        this._provider.openDatasetItem(parameters.reference, { columnName: parameters.columnName });
    }

    private async _init(): Promise<void> {
        const modules = this._getProps().modules;
        await this._moduleLoader.load(modules, this);
        if (this.lifecycle.isDestroyed()) {
            return;
        }
        if (!this.modules.find('rowModel')) {
            throw new Error('The grid needs a row model module, such as createClientSideRowModelModule().');
        }
        //before AG Grid is constructed, which the host renders once the grid is ready
        ModuleRegistry.registerModules([...RUNTIME_AG_GRID_MODULES, ...modules.flatMap(module => module.agGridModules ?? [])]);
        await this._getProps().onLoad?.(this);
        //after the modules so their api and provider listeners run first
        this._services.observe('gridApi', () => this._onGridApiAvailable());
    }

    private _destroy(): void {
        //AG Grid may unmount after this, so its api listeners clean up while it still answers
        this._removeGridApi?.();
        this._moduleLoader.destroy();
        this._services.destroy();
    }

    private _evaluateAgGridInitialOptions(): IGridAgGridInitialOptions['options'] {
        const result: IGridAgGridInitialOptions = {
            options: {
                rowModelType: this.modules.get('rowModel').type,
                rowHeight: this._services.get('settings').getDefaultRowHeight(),
                enableGroupEdit: true,
                animateRows: false,
                getRowId: this._getRowId,
                onGridReady: this._onGridReady,
                onGridPreDestroyed: this._onGridPreDestroyed,
                loadingOverlayComponent: LoadingOverlay,
                noRowsOverlayComponent: EmptyStateOverlay,
            },
        };
        this.hooks.agGridInitialOptions.apply(result);
        return result.options;
    }

    private _evaluateAgGridOptions(): ManagedGridOptions<IRecord> {
        const result: IGridAgGridOptions = {
            options: {
                loadingCellRenderer: RowLoading,
                suppressDragLeaveHidesColumns: true,
                enterNavigatesVertically: true,
                enterNavigatesVerticallyAfterEdit: true,
                //a grid with no height grows with its rows up to the theme's cap
                domLayout: this._services.get('settings').getHeight() ? 'normal' : 'autoHeight',
                columnDefs: this._columnDefs,
            },
        };
        this.hooks.agGridOptions.apply(result);
        return result.options;
    }

    private _onGridApiAvailable(): () => void {
        const provider = this._provider;
        const unsubscribe = provider.addEventListener('onNewDataLoaded', this._onNewDataLoaded);
        //loading the provider is the DatasetControl's, so the grid only draws what is there or waits for it
        if (provider.isFirstLoadRequested() && !provider.isLoading()) {
            this._onNewDataLoaded();
        }
        else {
            this._columnDefs = this._services.get('columns').getColumnDefinitions();
            this.refreshAgGridOptions();
        }
        return unsubscribe;
    }

    private _onNewDataLoaded = (): void => {
        //the server-side model reads grouping off the columns while it reloads
        this._columnDefs = this._services.get('columns').getColumnDefinitions();
        this.refreshAgGridOptions();
        this.modules.get('rowModel').refresh();
        this.events.dispatchEvent('onDataLoaded');
    };

    private _getRowId = (params: GetRowIdParams<IRecord>): string => `${params.data.getRecordId()}`;

    private _onGridReady = (event: GridReadyEvent<IRecord>): void => {
        this._removeGridApi = this._services.provide('gridApi', event.api);
    };

    private _onGridPreDestroyed = (): void => {
        this._removeGridApi?.();
        this._appliedAgGridOptions = {};
    };

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
