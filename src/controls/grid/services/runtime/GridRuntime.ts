import { ColDef, GetRowIdParams, GridReadyEvent, ManagedGridOptionKey, ManagedGridOptions, ModuleRegistry } from "@ag-grid-community/core";
import { AgGridReactProps } from "@ag-grid-community/react";
import { EventEmitter, IDataProvider, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { HookRegistry, LocalizationService, ServiceLocator } from "@utils";
import { FullRowLoading } from "@controls/grid/components/loading/full-row/FullRowLoading";
import { LoadingOverlay } from "@controls/grid/components/overlays/loading/LoadingOverlay";
import { EmptyRecords } from "@controls/grid/components/overlays/empty-records/EmptyRecordsOverlay";
import { IGridModule } from "../../modules";
import { IGrid, IGridEventHandlers } from "../../interfaces";
import { GRID_LABELS, IGridLabels } from "../../labels";
import { IGridServiceLocator, IGridServiceMap } from "../interfaces";
import { GridSettings } from "../settings";
import { GridRows } from "../rows";
import { GridColumns } from "../columns";
import { GridCells } from "../cells";
import { GridKeyboard } from "../keyboard";
import { GridColumnLayout } from "../column-layout";
import { GridOverlays } from "../overlays";
import { GridLegacyClientApiCompatibility } from "../legacy-client-api-compatibility/GridLegacyClientApiCompatibility";
import { GridSurfaces } from "../surfaces";

/** What AG Grid reads once, when it is created. */
export interface IGridAgGridInitialOptions {
    //plus the managed keys AG Grid needs before it hands over an api
    options: Omit<AgGridReactProps<IRecord>, ManagedGridOptionKey> & Pick<AgGridReactProps<IRecord>, 'rowHeight' | 'onGridReady' | 'onGridPreDestroyed'>;
}

/** What AG Grid can be handed at any time. */
export interface IGridAgGridOptions {
    options: ManagedGridOptions<IRecord>;
}

export interface IGridRuntimeEvents extends Pick<IGridEventHandlers, 'onDataLoaded'> {
    /** Fired when the grid is torn down. */
    onDestroy: () => void;
}

/** A hook over the options AG Grid reads only once, when it is created. */
export type GridAgGridInitialOptionsHook = (result: IGridAgGridInitialOptions) => void;

/** A hook over the options AG Grid can be handed at any time. */
export type GridAgGridOptionsHook = (result: IGridAgGridOptions) => void;

export interface IGridRuntimeParameters {
    /** The current props, read on demand so the grid follows them. */
    onGetProps: () => IGrid;
    /** The host context. */
    pcfContext: ComponentFramework.Context<any, any>;
    /** The control's theme. */
    theme: ITheme;
}

/** The running grid with its services and AG Grid options. */
export interface IGridRuntime {
    readonly events: IEventEmitter<IGridRuntimeEvents>;
    readonly services: IGridServiceLocator;
    /**
     * Registers a hook over the options AG Grid reads only once, when it is created.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerAgGridInitialOptions(hook: GridAgGridInitialOptionsHook, priority?: number): () => void;
    /**
     * Registers a hook over options re-applied whenever a value's reference changes.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerAgGridOptions(hook: GridAgGridOptionsHook, priority?: number): () => void;
    /** Runs the option hooks again and hands AG Grid the ones that changed. */
    refreshAgGridOptions(): void;
}

export class GridRuntime implements IGridRuntime {
    private _services = new ServiceLocator<IGridServiceMap>();
    private _onGetProps: () => IGrid;
    private _agGridInitialOptionsHooks = new HookRegistry<GridAgGridInitialOptionsHook>();
    private _agGridOptionsHooks = new HookRegistry<GridAgGridOptionsHook>();
    private _agGridProps?: IGridAgGridInitialOptions['options'];
    /** What AG Grid was last handed. */
    private _appliedAgGridOptions: ManagedGridOptions<IRecord> = {};
    private _columnDefs?: ColDef<IRecord>[];
    public readonly events: IEventEmitter<IGridRuntimeEvents> = new EventEmitter<IGridRuntimeEvents>();

    constructor({ onGetProps, pcfContext, theme }: IGridRuntimeParameters) {
        this._onGetProps = onGetProps;
        this._services.register('grid', () => this);
        //first api listener so the others find the options applied
        this._services.whenAvailable('gridApi', () => this.refreshAgGridOptions());

        //everything below reads the props and the provider through these
        const labels = new LocalizationService<IGridLabels>({ ...GRID_LABELS, ...onGetProps().labels });
        const settings = new GridSettings({ onGetProps });
        this._services.register('labels', () => labels);
        this._services.register('settings', () => settings);
        this._services.register('pcfContext', () => pcfContext);
        const provider = onGetProps().provider;
        this._services.register('provider', () => provider);
        this._services.register('theme', () => theme);
        //constructed once since a resolver runs on every lookup
        const columns = new GridColumns({ services: this._services });
        const cells = new GridCells({ services: this._services });
        const rows = new GridRows({ services: this._services });
        const keyboard = new GridKeyboard({ services: this._services });
        const surfaces = new GridSurfaces();
        //both wire themselves to the api and the provider
        new GridColumnLayout({ services: this._services });
        new GridOverlays({ services: this._services });
        this._services.register('columns', () => columns);
        this._services.register('cells', () => cells);
        this._services.register('rows', () => rows);
        this._services.register('keyboard', () => keyboard);
        this._services.register('surfaces', () => surfaces);
        //built once and never looked up
        new GridLegacyClientApiCompatibility({ services: this._services });

        const { custom = [], ...builtIns } = onGetProps().modules;
        const modules = [...Object.values(builtIns), ...custom].filter((module): module is IGridModule => !!module);
        for (const module of modules) {
            module.onRegister?.(this);
        }
        //before AG Grid is constructed on this same render
        ModuleRegistry.registerModules(modules.flatMap(module => module.agGridModules ?? []));
        //after the modules so their api and provider listeners run first
        this._services.whenAvailable('gridApi', () => this._onGridApiAvailable());
    }

    public get services(): IGridServiceLocator {
        return this._services;
    }

    public registerAgGridInitialOptions(hook: GridAgGridInitialOptionsHook, priority?: number): () => void {
        return this._agGridInitialOptionsHooks.register(hook, priority);
    }

    public registerAgGridOptions(hook: GridAgGridOptionsHook, priority?: number): () => void {
        return this._agGridOptionsHooks.register(hook, priority);
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
                //a customizer patches `setGridOption` to rewrite the keys it owns
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

    public destroy(): void {
        //the provider outlives the grid
        this._provider.removeEventListener('onNewDataLoaded', this._onNewDataLoaded);
        this.events.dispatchEvent('onDestroy');
        this.events.clearEventListeners();
        this._services.destroy();
    }

    private _evaluateAgGridInitialOptions(): IGridAgGridInitialOptions['options'] {
        const result: IGridAgGridInitialOptions = {
            options: {
                rowModelType: this._services.get('rowModel').type,
                rowHeight: this._services.get('settings').getDefaultRowHeight(),
                initialState: this._onGetProps().state,
                enableGroupEdit: true,
                reactiveCustomComponents: true,
                getRowId: this._getRowId,
                onGridReady: this._onGridReady,
                onGridPreDestroyed: this._onGridPreDestroyed,
                loadingOverlayComponent: LoadingOverlay,
                noRowsOverlayComponent: EmptyRecords,
            },
        };
        this._agGridInitialOptionsHooks.apply(result);
        return result.options;
    }

    private _evaluateAgGridOptions(): ManagedGridOptions<IRecord> {
        const result: IGridAgGridOptions = {
            options: {
                loadingCellRenderer: FullRowLoading,
                suppressDragLeaveHidesColumns: true,
                animateRows: false,
                enterNavigatesVertically: true,
                enterNavigatesVerticallyAfterEdit: true,
                columnDefs: this._columnDefs,
            },
        };
        this._agGridOptionsHooks.apply(result);
        return result.options;
    }

    private _onGridApiAvailable(): void {
        this._provider.addEventListener('onNewDataLoaded', this._onNewDataLoaded);
        if (!this._provider.isLoading()) {
            this._onNewDataLoaded();
            return;
        }
        this._columnDefs = this._services.get('columns').getColumnDefinitions();
        this.refreshAgGridOptions();
    }

    private _onNewDataLoaded = (): void => {
        //the server-side model reads grouping off the columns while it reloads
        this._columnDefs = this._services.get('columns').getColumnDefinitions();
        this.refreshAgGridOptions();
        this._services.get('rowModel').refresh();
        this._scrollToTop();
        this.events.dispatchEvent('onDataLoaded');
    };


    /** Back to the first row after a load. */
    private _scrollToTop(): void {
        const gridApi = this._services.find('gridApi');
        if (!gridApi || this._provider.isLoading() || this._provider.getSortedRecordIds().length === 0) {
            return;
        }
        gridApi.ensureIndexVisible(0, 'top');
    }

    private _getRowId = (params: GetRowIdParams<IRecord>): string => `${params.data.getRecordId()}`;

    private _onGridReady = (event: GridReadyEvent<IRecord>): void => {
        this._services.register('gridApi', () => event.api);
        this._onGetProps().onGridReady?.(this);
    };

    private _onGridPreDestroyed = (): void => {
        this._onGetProps().onDestroy?.(this);
    };

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
