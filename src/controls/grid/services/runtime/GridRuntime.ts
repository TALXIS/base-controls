import { GetRowIdParams, GridApi, GridPreDestroyedEvent, GridReadyEvent, ModuleRegistry } from "@ag-grid-community/core";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { HookRegistry, ILocalizationService, LocalizationService, ServiceLocator } from "@utils";
import { FullRowLoading } from "@controls/grid/components/loading/full-row/FullRowLoading";
import { LoadingOverlay } from "@controls/grid/components/overlays/loading/LoadingOverlay";
import { EmptyRecords } from "@controls/grid/components/overlays/empty-records/EmptyRecordsOverlay";
import { IGridModule, IGridModules } from "../../modules";
import { IGridRowModel } from "../../modules/row-model/interfaces";
import { IGridAggregation } from "../../modules/aggregation/GridAggregation";
import { IGridFiltering } from "../../modules/filtering/GridFiltering";
import { IGridGrouping } from "../../modules/grouping/GridGrouping";
import { IGridSelection } from "../../modules/selection/GridSelection";
import { IGridSorting } from "../../modules/sorting/GridSorting";
import { IGrid } from "../../interfaces";
import { GRID_LABELS, IGridLabels } from "../../labels";
import { IGridServiceLocator, IGridServiceMap } from "../interfaces";
import { GridSettings, IGridSettings } from "../settings";
import { GridRows, IGridRows } from "../rows";
import { GridColumns, IGridColumns } from "../columns";
import { GridCells, IGridCells } from "../cells";
import { GridKeyboard, IGridKeyboard } from "../keyboard";
import { GridColumnHeaders, IGridColumnHeaders } from "../column-header";
import { GridColumnLayout } from "../column-layout";
import { GridOverlays } from "../overlays";
import { GridSurfaces, IGridSurfaces } from "../surfaces";

export interface IGridAgGridProps {
    props: Partial<AgGridReactProps<IRecord>>;
}

/** A hook over the props AG Grid is created with. */
export type GridAgGridPropsHook = (result: IGridAgGridProps) => void;

export interface IGridRuntimeParameters {
    /** The current props, read on demand so the grid follows them. */
    onGetProps: () => IGrid;
    /** The host context. */
    pcfContext: ComponentFramework.Context<any, any>;
    /** The control's theme. */
    theme: ITheme;
}

/** The running grid: its services, and the props AG Grid is created with. */
export interface IGridRuntime {
    readonly services: IGridServiceLocator;
    readonly settings: IGridSettings;
    readonly labels: ILocalizationService<IGridLabels>;
    readonly provider: IDataProvider;
    readonly pcfContext: ComponentFramework.Context<any, any>;
    readonly theme: ITheme;
    readonly columns: IGridColumns;
    readonly cells: IGridCells;
    readonly rows: IGridRows;
    readonly keyboard: IGridKeyboard;
    readonly columnHeaders: IGridColumnHeaders;
    readonly surfaces: IGridSurfaces;
    readonly rowModel: IGridRowModel;
    readonly selection: IGridSelection | undefined;
    readonly sorting: IGridSorting | undefined;
    readonly filtering: IGridFiltering | undefined;
    readonly grouping: IGridGrouping | undefined;
    readonly aggregation: IGridAggregation | undefined;
    /** Only once AG Grid is ready. */
    readonly gridApi: GridApi<IRecord> | undefined;
    /** Only once the grid is mounted. */
    readonly gridRoot: HTMLElement | undefined;
    /**
     * Registers a hook over the props AG Grid is created with.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    registerAgGridProps(hook: GridAgGridPropsHook, priority?: number): () => void;
}

export class GridRuntime implements IGridRuntime {
    private _services = new ServiceLocator<IGridServiceMap>();
    private _onGetProps: () => IGrid;
    private _modules: IGridModule[];
    private _agGridPropsHooks = new HookRegistry<GridAgGridPropsHook>();
    private _agGridProps?: Partial<AgGridReactProps<IRecord>>;

    constructor({ onGetProps, pcfContext, theme }: IGridRuntimeParameters) {
        this._onGetProps = onGetProps;
        this._services.register('grid', () => this);

        //first: everything below reads the props and the provider through these
        const labels = new LocalizationService<IGridLabels>({ ...GRID_LABELS, ...onGetProps().labels });
        const settings = new GridSettings({ onGetProps });
        this._services.register('labels', () => labels);
        this._services.register('settings', () => settings);
        this._services.register('pcfContext', () => pcfContext);
        //the one service whose resolver is the point
        this._services.register('provider', () => onGetProps().provider);
        this._services.register('theme', () => theme);
        //constructed, then registered: a resolver runs on every lookup
        const columns = new GridColumns({ services: this._services });
        const cells = new GridCells({ services: this._services });
        const rows = new GridRows({ services: this._services });
        const keyboard = new GridKeyboard({ services: this._services });
        const columnHeaders = new GridColumnHeaders({ services: this._services });
        const surfaces = new GridSurfaces({ services: this._services });
        //both wait for an api and then talk only to it
        new GridColumnLayout({ services: this._services });
        new GridOverlays({ services: this._services });
        this._services.register('columns', () => columns);
        this._services.register('cells', () => cells);
        this._services.register('rows', () => rows);
        this._services.register('keyboard', () => keyboard);
        this._services.register('columnHeaders', () => columnHeaders);
        this._services.register('surfaces', () => surfaces);

        this._modules = orderModules(onGetProps().modules);
        for (const module of this._modules) {
            module.onRegister?.(this._services);
        }
        //after the modules have had their say, and before AG Grid is constructed on this same render
        ModuleRegistry.registerModules(this._modules.flatMap(module => module.agGridModules ?? []));

        //after the modules, whose own api listeners run first
        this._services.whenAvailable('gridApi', () => this._onGridApiAvailable());
    }

    public get services(): IGridServiceLocator {
        return this._services;
    }

    public get settings(): IGridSettings {
        return this._services.get('settings');
    }

    public get labels(): ILocalizationService<IGridLabels> {
        return this._services.get('labels');
    }

    public get provider(): IDataProvider {
        return this._services.get('provider');
    }

    public get pcfContext(): ComponentFramework.Context<any, any> {
        return this._services.get('pcfContext');
    }

    public get theme(): ITheme {
        return this._services.get('theme');
    }

    public get columns(): IGridColumns {
        return this._services.get('columns');
    }

    public get cells(): IGridCells {
        return this._services.get('cells');
    }

    public get rows(): IGridRows {
        return this._services.get('rows');
    }

    public get keyboard(): IGridKeyboard {
        return this._services.get('keyboard');
    }

    public get columnHeaders(): IGridColumnHeaders {
        return this._services.get('columnHeaders');
    }

    public get surfaces(): IGridSurfaces {
        return this._services.get('surfaces');
    }

    public get rowModel(): IGridRowModel {
        return this._services.get('rowModel');
    }

    public get selection(): IGridSelection | undefined {
        return this._services.find('selection');
    }

    public get sorting(): IGridSorting | undefined {
        return this._services.find('sorting');
    }

    public get filtering(): IGridFiltering | undefined {
        return this._services.find('filtering');
    }

    public get grouping(): IGridGrouping | undefined {
        return this._services.find('grouping');
    }

    public get aggregation(): IGridAggregation | undefined {
        return this._services.find('aggregation');
    }

    public get gridApi(): GridApi<IRecord> | undefined {
        return this._services.find('gridApi');
    }

    public get gridRoot(): HTMLElement | undefined {
        return this._services.find('gridRoot');
    }

    public registerAgGridProps(hook: GridAgGridPropsHook, priority?: number): () => void {
        return this._agGridPropsHooks.register(hook, priority);
    }

    /** The props AG Grid is created with: the grid's defaults, what the hooks made of them, then what the grid cannot work without. */
    public getAgGridProps(): AgGridReactProps<IRecord> {
        //once: a new callback per render is a new grid option to AG Grid
        this._agGridProps ??= this._createAgGridProps();
        return {
            ...this._agGridProps,
            getRowId: this._getRowId,
            //needs to be set here, crashes if set via API
            rowHeight: this.settings.getDefaultRowHeight(),
            initialState: this._onGetProps().state,
            //the api last: registering it builds the parts that push columns
            onGridReady: this._onGridReady,
            //before AG Grid tears down, so `getState()` still answers for whoever wants to persist it
            onGridPreDestroyed: this._onGridPreDestroyed,
        };
    }

    public onGridRootRef = (gridRoot: HTMLDivElement | null): void => {
        //a part listening ahead of AG Grid needs this element, and it exists only once mounted
        if (gridRoot) {
            this._services.register('gridRoot', () => gridRoot);
        }
    };

    /** Releases what the modules and the grid's own parts hold. */
    public destroy(): void {
        this._modules.forEach(module => module.onDestroy?.(this._services));
        this.keyboard.destroy();
        this._services.destroy();
    }

    private _createAgGridProps(): Partial<AgGridReactProps<IRecord>> {
        const result: IGridAgGridProps = {
            props: {
                loadingOverlayComponent: LoadingOverlay,
                noRowsOverlayComponent: EmptyRecords,
                loadingCellRenderer: FullRowLoading,
                enableGroupEdit: true,
                reactiveCustomComponents: true,
                suppressDragLeaveHidesColumns: true,
                animateRows: false,
                enterNavigatesVertically: true,
                enterNavigatesVerticallyAfterEdit: true,
            },
        };
        this._agGridPropsHooks.apply(result);
        return result.props;
    }

    private _getRowId = (params: GetRowIdParams<IRecord>): string => `${params.data.getRecordId()}`;

    private _onGridReady = (event: GridReadyEvent<IRecord>): void => {
        this._onGetProps().onGridReady?.(event.api);
        this._services.register('gridApi', () => event.api);
    };

    private _onGridPreDestroyed = (event: GridPreDestroyedEvent<IRecord>): void => {
        //the provider outlives the grid
        this.provider.removeEventListener('onNewDataLoaded', this._onNewDataLoaded);
        this.provider.removeEventListener('onRenderRequested', this._onRenderRequested);
        this._onGetProps().onDestroy?.(event.api);
    };

    /** Everything that needs a grid to talk to, in the order it needs doing. */
    private _onGridApiAvailable(): void {
        this.provider.addEventListener('onNewDataLoaded', this._onNewDataLoaded);
        this.provider.addEventListener('onRenderRequested', this._onRenderRequested);
        this.rowModel.applyGridOptions(this._gridApi);
        this._setCurrentColumns();
        if (!this.provider.isLoading()) {
            this._onNewDataLoaded();
        }
    }

    private _onRenderRequested = (): void => this._gridApi.refreshCells();

    private _onNewDataLoaded = (): void => {
        //columns first: the server-side model reads what is grouped off them while it reloads
        this._setCurrentColumns();
        this.rowModel.refresh(this._gridApi);
        this._scrollToTop();
    };

    private _setCurrentColumns(): void {
        this._gridApi.setGridOption('columnDefs', this.columns.getColumnDefinitions());
    }

    /** Back to the first row, because a load is a different list */
    private _scrollToTop(): void {
        if (this.provider.isLoading() || this.provider.getSortedRecordIds().length === 0) {
            return;
        }
        this._gridApi.ensureIndexVisible(0, 'top');
    }

    /** `get`, and not optional: only read once the api is registered. */
    private get _gridApi(): GridApi<IRecord> {
        return this._services.get('gridApi');
    }
}

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
