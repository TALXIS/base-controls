import { _, ColDef, GridApi, IRowNode, SelectionChangedEvent } from "@ag-grid-community/core";
import { EventEmitter, IDataProvider, IEventEmitter, IInterceptor, Interceptors, IRecord } from "@talxis/client-libraries";
import { getSelectionColumnDefinition } from "./getSelectionColumnDefinition";
import { SELECTION_COLUMN_KEY } from "./constants";
import { IGridRowSelectionServiceLocator } from "./services";
import { IGridRowSelectionComponents } from "./moduleComponents";
import { GRID_MODULE_PRIORITY } from "../priorities";
import { ITheme } from "@theme";
import { IGridStyles } from "../../services/runtime";
import { getGridRowSelectionStyles } from "./styles";
import { CELL_COMMANDS_CLASS_NAME } from "../../components/cells/ui/commands/styles";

declare module "../../services/interfaces" {
    interface IGridModuleServiceMap {
        /** Which records are selected. */
        rowSelection: IGridRowSelection;
    }
}

/** How a row's checkbox reads: its own state, or its children's. */
export type IGridRowSelectionState = 'checked' | 'unchecked' | 'indeterminate';

export interface IGridSelectRecordsParameters {
    provider: IDataProvider;
    recordIds: string[];
}

/** What another module can wrap, deciding whether the default action runs at all. */
export interface IGridRowSelectionInterceptors {
    /** Writes a selection to the provider that owns the records. */
    onSelectRecords: (parameters: IGridSelectRecordsParameters) => Promise<void>;
}

export interface IGridRowSelectionEvents {
    /** Fired when the selected records change, with the ids now selected. */
    onSelectionChanged: (selectedRecordIds: string[]) => void;
}

export interface IGridRowSelectionParameters {
    /** This module's own locator. */
    services: IGridRowSelectionServiceLocator;
    /** How many rows may be selected at once. */
    mode: 'single' | 'multiple';
    onSelectionChanged?: IGridRowSelectionEvents['onSelectionChanged'];
}

/** Keeps the grid's and the providers' selection in sync. */
export interface IGridRowSelection {
    readonly events: IEventEmitter<IGridRowSelectionEvents>;
    /** How many rows may be selected at once. */
    getMode(): 'single' | 'multiple';
    setInterceptor<K extends keyof IGridRowSelectionInterceptors>(event: K, interceptor: IInterceptor<IGridRowSelectionInterceptors, K>): void;
    /** Selects the records, through whatever intercepts `onSelectRecords`. */
    selectRecords(provider: IDataProvider, recordIds: string[]): Promise<void>;
    /** Selects the record, or deselects it, through whatever intercepts `onSelectRecords`. */
    toggleRecord(record: IRecord): Promise<void>;
    /** Whether the column carrying the checkboxes is this one. */
    isSelectionColumn(columnName: string | undefined): boolean;
    /** How a row's checkbox should read. */
    getRecordSelectionState(node: IRowNode<IRecord>): IGridRowSelectionState;
    /** Whether a record refuses selection at all. */
    isRecordSelectionDisabled(record: IRecord): boolean;
    /** The parts of what this module draws, as the caller replaced them. */
    readonly components: IGridRowSelectionComponents;
}

export class GridRowSelection implements IGridRowSelection {
    private _services: IGridRowSelectionServiceLocator;
    private _mode: 'single' | 'multiple';
    /** The persisted selection waiting for its records to load. */
    private _pendingRestoreRecordIds: string[] = [];
    /** Tokens that let only the latest selection per provider write. */
    private _selectionTokens: WeakMap<IDataProvider, number> = new WeakMap();
    private _interceptors = new Interceptors<IGridRowSelectionInterceptors>();
    public readonly events: IEventEmitter<IGridRowSelectionEvents> = new EventEmitter<IGridRowSelectionEvents>();

    constructor(parameters: IGridRowSelectionParameters) {
        this._services = parameters.services;
        this._mode = parameters.mode;
        this._services.get('gridServices').whenAvailable('gridApi', () => this._onGridApiAvailable());
        this._registerEvents(parameters);
        this._registerHooks();
    }

    public getMode(): 'single' | 'multiple' {
        return this._mode;
    }

    public setInterceptor<K extends keyof IGridRowSelectionInterceptors>(event: K, interceptor: IInterceptor<IGridRowSelectionInterceptors, K>): void {
        this._interceptors.setInterceptor(event, interceptor);
    }

    public toggleRecord(record: IRecord): Promise<void> {
        const provider = record.getDataProvider();
        const recordId = record.getRecordId();
        //the provider's own selection, group rows included
        const selectedRecordIds = provider.getSelectedRecordIds({ includeGroupRecordIds: true, includeChildrenRecordIds: false });
        const isSelected = selectedRecordIds.includes(recordId);
        if (this._mode === 'single') {
            return this.selectRecords(provider, isSelected ? [] : [recordId]);
        }
        return this.selectRecords(provider, isSelected ? selectedRecordIds.filter(id => id !== recordId) : [...selectedRecordIds, recordId]);
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

    public isSelectionColumn(columnName: string | undefined): boolean {
        return columnName === SELECTION_COLUMN_KEY;
    }

    public getRecordSelectionState(node: IRowNode<IRecord>): IGridRowSelectionState {
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
        //a group selects every record under it
        return provider.getSummarizationType() === 'grouping' && this._mode === 'single';
    }

    public get components(): IGridRowSelectionComponents {
        return this._services.get('components');
    }

    private _registerEvents(parameters: IGridRowSelectionParameters): void {
        this._services.get('gridServices').get('grid').events.addEventListener('onDestroyed', this._onDestroyed);
        if (parameters.onSelectionChanged) {
            this.events.addEventListener('onSelectionChanged', parameters.onSelectionChanged);
        }
    }

    private _registerHooks(): void {
        const gridServices = this._services.get('gridServices');
        gridServices.get('columns').registerColumnDefinitions(this._onColumnDefinitions, GRID_MODULE_PRIORITY.rowSelection);
        gridServices.get('grid').registerAgGridOptions(result => result.options.rowSelection = this._mode, GRID_MODULE_PRIORITY.rowSelection);
        gridServices.get('grid').registerStyles(this._onStyles, GRID_MODULE_PRIORITY.rowSelection);
    }

    private _onStyles = (result: IGridStyles, theme: ITheme): void => {
        result.styles.push(getGridRowSelectionStyles(theme));
    };

    /** Adds the column the checkboxes live in. */
    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        columnDefs.unshift(getSelectionColumnDefinition());
    };

    private _onDestroyed = (): void => {
        this._provider.removeEventListener('onRecordsSelected', this._onRecordsSelected);
        this._services.get('gridServices').find('gridRoot')?.removeEventListener('click', this._onCaptureClick, true);
    };

    private _onGridApiAvailable(): void {
        this._provider.addEventListener('onRecordsSelected', this._onRecordsSelected);
        this._gridApi.addEventListener('selectionChanged', this._onGridSelectionChanged);
        this._services.get('gridServices').whenAvailable('gridRoot',
            gridRoot => gridRoot.addEventListener('click', this._onCaptureClick, true));
        //the host's persisted selection, restored once its rows are in
        this._pendingRestoreRecordIds = this._provider.getSelectedRecordIds();
        if (this._pendingRestoreRecordIds.length) {
            this._gridApi.addEventListener('modelUpdated', this._onModelUpdated);
        }
    }

    /** Decides what may reach AG Grid's own row-click selection, before it gets the chance. */
    private _onCaptureClick = (event: Event): void => {
        const target = event.target as HTMLElement;
        const rowId = target.closest?.('[row-id]')?.getAttribute('row-id');
        const colId = target.closest?.('[col-id]')?.getAttribute('col-id');
        const hasModifier = (event as MouseEvent).ctrlKey || (event as MouseEvent).metaKey || (event as MouseEvent).shiftKey;
        //the checkbox, a cell's commands and a plain click on a group row bypass AG Grid's selection
        const node = rowId ? this._gridApi.getRowNode(rowId) : undefined;
        const isGroupRow = !!node && !!this._services.get('gridServices').find('grouping')?.isGroupRow(node);
        const isCommand = !!target.closest?.(`.${CELL_COMMANDS_CLASS_NAME}`);
        if (this.isSelectionColumn(colId ?? undefined) || isCommand || (isGroupRow && !hasModifier)) {
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

    private _onRecordsSelected = (selectedRecordIds: string[]): void => {
        this._onProviderSelectionChanged();
        this.events.dispatchEvent('onSelectionChanged', selectedRecordIds);
    };

    private _onProviderSelectionChanged = (): void => {
        const selectedRecordIds = this._provider.getSelectedRecordIds({ includeGroupRecordIds: true });
        this._rowModel.setSelectedRecordIds(this._gridApi, selectedRecordIds);
        this._refreshSelectionColumn();
    };

    /** Draws the checkboxes again. */
    private _refreshSelectionColumn(): void {
        this._gridApi.refreshCells({ columns: [SELECTION_COLUMN_KEY], force: true });
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
            //the provider owning the clicked row's record
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
        const recordIdsByProvider = this._getRecordIdsByOwner(this._pendingRestoreRecordIds);
        this._pendingRestoreRecordIds = [];
        this._gridApi.removeEventListener('modelUpdated', this._onModelUpdated);
        //the top level first so a group its children mark stays marked
        this._provider.setSelectedRecordIds(recordIdsByProvider.get(this._provider) ?? []);
        recordIdsByProvider.forEach((recordIds, provider) => {
            if (provider !== this._provider) {
                provider.setSelectedRecordIds(recordIds);
            }
        });
        this._scrollToSelection(nodes);
    }

    /** Groups each id under the loaded provider that holds it. */
    private _getRecordIdsByOwner(recordIds: string[]): Map<IDataProvider, string[]> {
        const childProviders = this._provider.getGroupedRecordDataProviders(true);
        const result = new Map<IDataProvider, string[]>();
        for (const recordId of recordIds) {
            const owner = childProviders.find(provider => !!provider.getRecordsMap()[recordId]) ?? this._provider;
            result.set(owner, [...(result.get(owner) ?? []), recordId]);
        }
        return result;
    }

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
