import { ColDef, GetRowIdParams, GridPreDestroyedEvent, GridReadyEvent, ManagedGridOptionKey, ManagedGridOptions, ModuleRegistry } from "@ag-grid-community/core";
import { AgGridReactProps } from "@ag-grid-community/react";
import { EventEmitter, IDataProvider, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { HookRegistry, LocalizationService, ServiceLocator } from "@utils";
import { FullRowLoading } from "@controls/grid/components/loading/full-row/FullRowLoading";
import { LoadingOverlay } from "@controls/grid/components/overlays/loading/LoadingOverlay";
import { EmptyRecords } from "@controls/grid/components/overlays/empty-records/EmptyRecordsOverlay";
import { IGridModule } from "../../modules";
import { IGrid } from "../../interfaces";
import { GRID_LABELS, IGridLabels } from "../../labels";
import { GridComponents } from "../../components/components";
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
    //managed keys too, where AG Grid needs them before it hands over an api
    options: Omit<AgGridReactProps<IRecord>, ManagedGridOptionKey> & Pick<AgGridReactProps<IRecord>, 'rowHeight' | 'onGridReady' | 'onGridPreDestroyed'>;
}

/** What AG Grid can be handed at any time. */
export interface IGridAgGridOptions {
    options: ManagedGridOptions<IRecord>;
}

export interface IGridRuntimeEvents {
    /** The grid is being torn down: release whatever outlives it. */
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

/** The running grid: its services, and what AG Grid is created with and handed afterwards. */
export interface IGridRuntime {
    readonly events: IEventEmitter<IGridRuntimeEvents>;
    readonly services: IGridServiceLocator;
    /**
     * Registers a hook over the options AG Grid reads only once, when it is created.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    registerAgGridInitialOptions(hook: GridAgGridInitialOptionsHook, priority?: number): () => void;
    /**
     * Registers a hook over the grid's options; a value is re-applied only when its reference changes.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
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
    /** What AG Grid was last handed, which a refresh is compared against. */
    private _appliedAgGridOptions: ManagedGridOptions<IRecord> = {};
    private _columnDefs?: ColDef<IRecord>[];
    public readonly events: IEventEmitter<IGridRuntimeEvents> = new EventEmitter<IGridRuntimeEvents>();

    constructor({ onGetProps, pcfContext, theme }: IGridRuntimeParameters) {
        this._onGetProps = onGetProps;
        this._services.register('grid', () => this);
        //ahead of every other api listener, so they find the options applied
        this._services.whenAvailable('gridApi', () => this.refreshAgGridOptions());

        //first: everything below reads the props and the provider through these
        const labels = new LocalizationService<IGridLabels>({ ...GRID_LABELS, ...onGetProps().labels });
        const settings = new GridSettings({ onGetProps });
        this._services.register('labels', () => labels);
        this._services.register('settings', () => settings);
        this._services.register('pcfContext', () => pcfContext);
        //the one service whose resolver is the point
        this._services.register('provider', () => onGetProps().provider);
        this._services.register('theme', () => theme);
        //a resolver as well: a slot closes over the caller's own state
        this._services.register('components', () => ({ ...GridComponents, ...onGetProps().components }));
        //constructed, then registered: a resolver runs on every lookup
        const columns = new GridColumns({ services: this._services });
        const cells = new GridCells({ services: this._services });
        const rows = new GridRows({ services: this._services });
        const keyboard = new GridKeyboard({ services: this._services });
        const surfaces = new GridSurfaces({ services: this._services });
        //both wait for an api and then talk only to it
        new GridColumnLayout({ services: this._services });
        new GridOverlays({ services: this._services });
        this._services.register('columns', () => columns);
        this._services.register('cells', () => cells);
        this._services.register('rows', () => rows);
        this._services.register('keyboard', () => keyboard);
        this._services.register('surfaces', () => surfaces);
        //registers its hooks once for every cell, so nothing needs to look it up
        new GridLegacyClientApiCompatibility({ services: this._services });

        const modules = Object.values(onGetProps().modules).filter((module): module is IGridModule => !!module);
        for (const module of modules) {
            module.onRegister?.(this._services);
        }
        //after the modules have had their say, and before AG Grid is constructed on this same render
        ModuleRegistry.registerModules(modules.flatMap(module => module.agGridModules ?? []));
        //after the modules, whose own provider listeners run ahead of this one
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
        //in the order the hooks wrote them, so an owner decides what lands first
        const keys = new Set([...Object.keys(next), ...Object.keys(previous)] as ManagedGridOptionKey[]);
        for (const key of keys) {
            if (next[key] !== previous[key]) {
                //one key at a time: a customizer patches `setGridOption` to rewrite what it owns
                gridApi.setGridOption(key, next[key]);
            }
        }
        this._appliedAgGridOptions = next;
    }

    /** The props AG Grid is created with: the grid's defaults, and what the hooks made of them. */
    public getAgGridProps(): AgGridReactProps<IRecord> {
        //once: the options reach AG Grid through `refreshAgGridOptions`
        this._agGridProps ??= this._evaluateAgGridInitialOptions();
        return this._agGridProps;
    }

    public onGridRootRef = (gridRoot: HTMLDivElement | null): void => {
        //a part listening ahead of AG Grid needs this element, and it exists only once mounted
        if (gridRoot) {
            this._services.register('gridRoot', () => gridRoot);
        }
    };

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
        //columns first: the server-side model reads what is grouped off them while it reloads
        this._columnDefs = this._services.get('columns').getColumnDefinitions();
        this.refreshAgGridOptions();
        this._services.get('rowModel').refresh();
        this._scrollToTop();
    };

    /** Back to the first row, because a load is a different list */
    private _scrollToTop(): void {
        const gridApi = this._services.find('gridApi');
        if (!gridApi || this._provider.isLoading() || this._provider.getSortedRecordIds().length === 0) {
            return;
        }
        gridApi.ensureIndexVisible(0, 'top');
    }

    private _getRowId = (params: GetRowIdParams<IRecord>): string => `${params.data.getRecordId()}`;

    private _onGridReady = (event: GridReadyEvent<IRecord>): void => {
        this._onGetProps().onGridReady?.(event.api);
        this._services.register('gridApi', () => event.api);
    };

    private _onGridPreDestroyed = (event: GridPreDestroyedEvent<IRecord>): void => {
        this._onGetProps().onDestroy?.(event.api);
    };

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
