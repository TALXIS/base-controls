import { _, ColDef, GridApi, ICellRendererParams, IRowNode, SelectionChangedEvent } from "@ag-grid-community/core";
import { DataProvider, IDataProvider, IInterceptor, Interceptors, IRecord } from "@talxis/client-libraries";
import { RECORD_SAVE_COLUMN_KEY } from "../../services/columns";
import { getSelectionColumnDefinition } from "./getSelectionColumnDefinition";
import { IGridSelectionServiceLocator } from "./services";
import { IGridSelectionComponents } from "./moduleComponents";
import { IColumnHeaderParams } from "../../components/column-header/root/ColumnHeaderRoot";
import { GRID_MODULE_PRIORITY } from "../priorities";

/** How a row's checkbox reads: its own state, or its children's. */
export type IGridSelectionState = 'checked' | 'unchecked' | 'indeterminate';

export interface IGridSelectRecordsParameters {
    provider: IDataProvider;
    recordIds: string[];
}

/** What another module can wrap, deciding whether the default action runs at all. */
export interface IGridSelectionInterceptors {
    /** Writes a selection to the provider that owns the records. */
    onSelectRecords: (parameters: IGridSelectRecordsParameters) => Promise<void>;
}

export interface IGridSelectionParameters {
    /** This module's own locator. */
    services: IGridSelectionServiceLocator;
    /** How many rows may be selected at once. */
    mode: 'single' | 'multiple';
}

/** Which records are selected, in both directions.  meet */
export interface IGridSelection {
    /** How many rows may be selected at once. */
    getMode(): 'single' | 'multiple';
    setInterceptor<K extends keyof IGridSelectionInterceptors>(event: K, interceptor: IInterceptor<IGridSelectionInterceptors, K>): void;
    /** Selects the records, through whatever intercepts `onSelectRecords`. */
    selectRecords(provider: IDataProvider, recordIds: string[]): Promise<void>;
    /** Whether the column carrying the checkboxes is this one. */
    isSelectionColumn(columnName: string | undefined): boolean;
    /** How a row's checkbox should read. */
    getRecordSelectionState(node: IRowNode<IRecord>): IGridSelectionState;
    /** Whether a record refuses selection at all. */
    isRecordSelectionDisabled(record: IRecord): boolean;
    /** The parts this module renders, merged with whatever the caller replaced. */
    readonly components: IGridSelectionComponents;
}

export class GridSelection implements IGridSelection {
    private _services: IGridSelectionServiceLocator;
    private _mode: 'single' | 'multiple';
    /** What the host persisted, until the records it names have been loaded and it can be */
    private _pendingRestoreRecordIds: string[] = [];
    /** The latest selection per provider, which is the one allowed to write. */
    private _selectionTokens: WeakMap<IDataProvider, number> = new WeakMap();
    private _interceptors = new Interceptors<IGridSelectionInterceptors>();

    constructor(parameters: IGridSelectionParameters) {
        this._services = parameters.services;
        this._mode = parameters.mode;
        this._services.get('gridServices').whenAvailable('gridApi', () => this._onGridApiAvailable());
        this._services.get('gridServices').get('grid').events.addEventListener('onDestroy', this._onDestroy);
        this._registerHooks();
    }

    private _registerHooks(): void {
        const gridServices = this._services.get('gridServices');
        gridServices.get('columns').registerColumnDefinitionsHook(this._onColumnDefinitions, GRID_MODULE_PRIORITY.selection);
        gridServices.get('grid').registerAgGridOptions(result => result.options.rowSelection = this._mode, GRID_MODULE_PRIORITY.selection);
    }

    public getMode(): 'single' | 'multiple' {
        return this._mode;
    }

    public setInterceptor<K extends keyof IGridSelectionInterceptors>(event: K, interceptor: IInterceptor<IGridSelectionInterceptors, K>): void {
        this._interceptors.setInterceptor(event, interceptor);
    }

    public async selectRecords(provider: IDataProvider, recordIds: string[]): Promise<void> {
        const token = (this._selectionTokens.get(provider) ?? 0) + 1;
        this._selectionTokens.set(provider, token);
        let isApplied = false;
        await this._interceptors.execute('onSelectRecords', { provider, recordIds }, async parameters => {
            if (this._selectionTokens.get(provider) !== token) {
                return;
            }
            isApplied = true;
            parameters.provider.setSelectedRecordIds(parameters.recordIds);
        });
        //a refused click has already ticked the checkbox
        if (!isApplied && this._selectionTokens.get(provider) === token) {
            this._onProviderSelectionChanged();
        }
    }

    /** Adds the column the checkboxes live in */
    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const recordSaveColumnIndex = columnDefs.findIndex(colDef => colDef.colId === RECORD_SAVE_COLUMN_KEY);
        if (recordSaveColumnIndex !== -1) {
            columnDefs.splice(recordSaveColumnIndex, 1);
        }
        columnDefs.unshift(getSelectionColumnDefinition(this._onRenderHeader, this._onRenderCell));
        columnDefs.forEach(colDef => this._suppressNavigation(colDef));
    };

    /** Takes navigation off the checkbox column. */
    private _suppressNavigation(colDef: ColDef<IRecord>): void {
        const onCellDoubleClicked = colDef.onCellDoubleClicked;
        colDef.onCellDoubleClicked = event => {
            if (this.isSelectionColumn(event.colDef.colId ?? undefined)) {
                return;
            }
            onCellDoubleClicked?.(event);
        };
    }

    public isSelectionColumn(columnName: string | undefined): boolean {
        return columnName === DataProvider.CONST.CHECKBOX_COLUMN_KEY;
    }

    public getRecordSelectionState(node: IRowNode<IRecord>): IGridSelectionState {
        const record = node.data!;
        const childDataProvider = record.getDataProvider().getGroupedRecordDataProvider(record.getRecordId());
        if (!childDataProvider) {
            return node.isSelected() ? 'checked' : 'unchecked';
        }
        if (node.isSelected()) {
            return 'checked';
        }
        return childDataProvider.getSelectedRecordIds().length === 0 ? 'unchecked' : 'indeterminate';
    }

    public isRecordSelectionDisabled(record: IRecord): boolean {
        const provider = record.getDataProvider();
        //a group selects every record under it.
        return provider.getSummarizationType() === 'grouping' && this._mode === 'single';
    }

    //the render methods reached through a field of ours.
    private _onRenderHeader = (props: IColumnHeaderParams): JSX.Element => this.components.onRenderHeader(props);
    private _onRenderCell = (props: ICellRendererParams<IRecord>): JSX.Element => this.components.onRenderCell(props);

    public get components(): IGridSelectionComponents {
        return this._services.get('components');
    }

    private _onDestroy = (): void => {
        this._provider.removeEventListener('onRecordsSelected', this._onProviderSelectionChanged);
        this._services.get('gridServices').find('gridRoot')?.removeEventListener('click', this._onCaptureClick, true);
    };

    private _onGridApiAvailable(): void {
        this._provider.addEventListener('onRecordsSelected', this._onProviderSelectionChanged);
        this._gridApi.addEventListener('selectionChanged', this._onGridSelectionChanged);
        this._services.get('gridServices').whenAvailable('gridRoot',
            gridRoot => gridRoot.addEventListener('click', this._onCaptureClick, true));
        //what the host persisted, taken and cleared in one go
        this._pendingRestoreRecordIds = this._provider.getSelectedRecordIds();
        if (this._pendingRestoreRecordIds.length) {
            this._provider.clearSelectedRecordIds();
            this._gridApi.addEventListener('modelUpdated', this._onModelUpdated);
        }
    }

    /** Decides what may reach AG Grid's own row-click selection, before it gets the chance. */
    private _onCaptureClick = (event: Event): void => {
        const target = event.target as HTMLElement;
        const rowId = target.closest?.('[row-id]')?.getAttribute('row-id');
        const colId = target.closest?.('[col-id]')?.getAttribute('col-id');
        const hasModifier = (event as MouseEvent).ctrlKey || (event as MouseEvent).metaKey || (event as MouseEvent).shiftKey;
        //the checkbox owns its own click, and a group row gives up selecting on a plain one.
        const node = rowId ? this._gridApi.getRowNode(rowId) : undefined;
        const isGroupRow = !!node && !!this._services.get('gridServices').find('grouping')?.isGroupRow(node);
        if (this.isSelectionColumn(colId ?? undefined) || (isGroupRow && !hasModifier)) {
            _.stopPropagationForAgGrid(event);
        }
    };

    private _onGridSelectionChanged = (event: SelectionChangedEvent<IRecord>): void => {
        //the source is the only fence there is
        if (event.source === 'api' || event.source === 'apiSelectAll') {
            return;
        }
        this._writeToProviders();
    };

    private _onProviderSelectionChanged = (): void => {
        const selectedRecordIds = this._provider.getSelectedRecordIds({ includeGroupRecordIds: true });
        this._rowModel.setSelectedRecordIds(this._gridApi, selectedRecordIds);
        this._refreshSelectionColumn();
    };

    /** Draws the checkboxes again. */
    private _refreshSelectionColumn(): void {
        this._gridApi.refreshCells({ columns: [DataProvider.CONST.CHECKBOX_COLUMN_KEY], force: true });
    }

    private _onModelUpdated = (): void => {
        this._applyPendingRestore();
    };

    /** Puts a click onto the providers it concerns. */
    private _writeToProviders(): void {
        const selectedRecordIdsByProvider = new Map<IDataProvider, string[]>();
        for (const provider of this._getProvidersHoldingSelection()) {
            selectedRecordIdsByProvider.set(provider, []);
        }
        for (const recordId of this._rowModel.getSelectedRecordIds(this._gridApi)) {
            //the row's own record, which is the one that was clicked.
            const provider = this._gridApi.getRowNode(recordId)?.data?.getDataProvider() ?? this._provider;
            const recordIds = selectedRecordIdsByProvider.get(provider) ?? [];
            recordIds.push(recordId);
            selectedRecordIdsByProvider.set(provider, recordIds);
        }
        selectedRecordIdsByProvider.forEach((recordIds, provider) => this.selectRecords(provider, recordIds));
    }

    //group ids asked for explicitly: nothing else reports a group marker
    private _getProvidersHoldingSelection(): IDataProvider[] {
        return [this._provider, ...this._provider.getGroupedRecordDataProviders(true)]
            .filter(provider => provider.getSelectedRecordIds({ includeChildrenRecordIds: false, includeGroupRecordIds: true }).length > 0);
    }

    /** Re-applies a persisted selection once the rows it names are in the grid. */
    private _applyPendingRestore(): void {
        const nodes = this._pendingRestoreRecordIds
            .map(recordId => this._gridApi.getRowNode(recordId))
            .filter((node): node is IRowNode<IRecord> => !!node?.data);
        if (!nodes.length) {
            return;
        }
        const pendingRecordIds = new Set(this._pendingRestoreRecordIds);
        this._pendingRestoreRecordIds = [];
        this._gridApi.removeEventListener('modelUpdated', this._onModelUpdated);
        //per provider, because a selection spanning groups is held by the provider each row came
        const providers = new Set(nodes.map(node => node.data!.getDataProvider()));
        for (const provider of providers) {
            provider.setSelectedRecordIds(Object.keys(provider.getRecordsMap()).filter(recordId => pendingRecordIds.has(recordId)));
        }
        this._scrollToSelection(nodes);
    }

    //the middle one rather than the first
    private _scrollToSelection(nodes: IRowNode<IRecord>[]): void {
        this._gridApi.ensureNodeVisible(nodes[Math.floor(nodes.length / 2)], 'middle');
    }

    private get _rowModel() {
        return this._services.get('gridServices').get('rowModel');
    }

    private get _gridApi(): GridApi<IRecord> {
        return this._services.get('gridServices').get('gridApi');
    }

    private get _provider(): IDataProvider {
        return this._services.get('gridServices').get('provider');
    }
}
