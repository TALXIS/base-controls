import { _, GridApi, IRowNode, SelectionChangedEvent } from "@ag-grid-community/core";
import { DataProvider, IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridSelectionServiceLocator } from "./services";
import { IGridSelectionComponents } from "./moduleComponents";

/** How a row's checkbox reads: its own state, or its children's. */
export type IGridSelectionState = 'checked' | 'unchecked' | 'indeterminate';

export interface IGridSelectionParameters {
    /** This module's own locator, which is what everything inside it reaches through. */
    services: IGridSelectionServiceLocator;
    /** How many rows may be selected at once. */
    mode: 'single' | 'multiple';
}

/**
 * Which records are selected, in both directions.
 *
 * The provider is the one authority, exactly as it is for the records themselves: a click is written to it,
 * and the rows are then drawn from what it says — never from what the grid last drew. The two directions
 * meet, so the write the module makes onto the rows is fenced off with {@link _isApplying} rather than
 * relying on a change arriving late enough to be harmless.
 */
export class GridSelection {
    private _services: IGridSelectionServiceLocator;
    private _mode: 'single' | 'multiple';
    /** What the host persisted, until the records it names have been loaded and it can be applied. */
    private _pendingRestoreRecordIds: string[] = [];

    constructor(parameters: IGridSelectionParameters) {
        this._services = parameters.services;
        this._mode = parameters.mode;
        this._services.get('gridServices').whenAvailable('gridApi', () => this._onGridApiAvailable());
    }

    /** How many rows may be selected at once. */
    public getMode(): 'single' | 'multiple' {
        return this._mode;
    }

    /** Whether the column carrying the checkboxes is this one. */
    public isSelectionColumn(columnName: string | undefined): boolean {
        return columnName === DataProvider.CONST.CHECKBOX_COLUMN_KEY;
    }

    /**
     * How a row's checkbox should read.
     *
     * A row with children of its own is indeterminate while some of them are selected, so a parent shows
     * what its group holds rather than only what it is itself.
     */
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

    /**
     * Whether a record refuses selection at all.
     *
     * A group row is only ever a whole group, so selecting one where a single record is all that may be
     * held is refused; and under nested grouping only the innermost level carries records rather than
     * further groups.
     */
    public isRecordSelectionDisabled(record: IRecord): boolean {
        const provider = record.getDataProvider();
        //a group selects every record under it, which is the opposite of what `single` means
        return provider.getSummarizationType() === 'grouping' && this._mode === 'single';
    }

    /** The parts this module renders, merged with whatever the caller replaced. */
    public get components(): IGridSelectionComponents {
        return this._services.get('components');
    }

    /** Releases the listeners this holds, which outlive the grid otherwise. */
    public destroy(): void {
        this._provider.removeEventListener('onRecordsSelected', this._onProviderSelectionChanged);
        this._services.get('gridServices').find('gridRoot')?.removeEventListener('click', this._onCaptureClick, true);
    }

    private _onGridApiAvailable(): void {
        this._provider.addEventListener('onRecordsSelected', this._onProviderSelectionChanged);
        this._gridApi.addEventListener('selectionChanged', this._onGridSelectionChanged);
        this._services.get('gridServices').whenAvailable('gridRoot',
            gridRoot => gridRoot.addEventListener('click', this._onCaptureClick, true));
        //what the host persisted, taken and cleared in one go: it is the grid's to apply from here, and
        //leaving it on the provider would have the first write of ours read as the user's
        this._pendingRestoreRecordIds = this._provider.getSelectedRecordIds();
        if (this._pendingRestoreRecordIds.length) {
            this._provider.clearSelectedRecordIds();
            this._gridApi.addEventListener('modelUpdated', this._onModelUpdated);
        }
    }

    /**
     * Decides what may reach AG Grid's own row-click selection, before it gets the chance.
     *
     * The marker is what AG Grid checks on its first line, and unlike `stopPropagation` it leaves the DOM
     * event alone — so the checkbox's own handler still runs. It has to be the capture phase: AG Grid
     * listens on the row container, which is ahead of React's delegated handler in bubble order.
     */
    private _onCaptureClick = (event: Event): void => {
        const target = event.target as HTMLElement;
        const rowId = target.closest?.('[row-id]')?.getAttribute('row-id');
        const colId = target.closest?.('[col-id]')?.getAttribute('col-id');
        const hasModifier = (event as MouseEvent).ctrlKey || (event as MouseEvent).metaKey || (event as MouseEvent).shiftKey;
        //the checkbox owns its own click, and a group row gives up selecting on a plain one: a click there
        //is for expanding it, and its checkbox or a modifier is how it gets selected instead
        const isGroupRow = !!rowId && !!this._gridApi.getRowNode(rowId)?.group;
        if (this.isSelectionColumn(colId ?? undefined) || (isGroupRow && !hasModifier)) {
            _.stopPropagationForAgGrid(event);
        }
    };

    private _onGridSelectionChanged = (event: SelectionChangedEvent<IRecord>): void => {
        //the source is the only fence there is: `selectionChanged` reaches a listener asynchronously, so a
        //flag set around our own write is always cleared again before this runs
        if (event.source === 'api' || event.source === 'apiSelectAll') {
            return;
        }
        this._writeToProviders();
    };

    private _onProviderSelectionChanged = (): void => {
        const selectedRecordIds = this._provider.getSelectedRecordIds({ includeGroupRecordIds: true });
        this._rowModel.setSelectedRecordIds(this._gridApi, selectedRecordIds);
        //the checkbox is what reads the state, and only the grid can be told to draw it again
        this._gridApi.refreshCells({ columns: [DataProvider.CONST.CHECKBOX_COLUMN_KEY], force: true });
    };

    private _onModelUpdated = (): void => {
        this._applyPendingRestore();
    };

    /**
     * Puts a click onto the providers it concerns.
     *
     * Every provider that holds a selection is seeded empty first, so a provider the user just emptied is
     * written as empty rather than left holding what it used to: the selected nodes alone cannot say that a
     * provider no longer has any.
     */
    private _writeToProviders(): void {
        const selectedRecordIdsByProvider = new Map<IDataProvider, string[]>();
        for (const provider of this._getProvidersHoldingSelection()) {
            selectedRecordIdsByProvider.set(provider, []);
        }
        for (const recordId of this._rowModel.getSelectedRecordIds(this._gridApi)) {
            //a grouped provider's records are in the root's map too, so this finds the one holding it - and
            //a nested group id written to the root instead corrupts that provider's counts
            const provider = this._provider.getRecordsMap()[recordId]?.getDataProvider() ?? this._provider;
            const recordIds = selectedRecordIdsByProvider.get(provider) ?? [];
            recordIds.push(recordId);
            selectedRecordIdsByProvider.set(provider, recordIds);
        }
        selectedRecordIdsByProvider.forEach((recordIds, provider) => provider.setSelectedRecordIds(recordIds));
    }

    //group ids asked for explicitly: a group marker is a selection worth seeding to empty, and it is the
    //only way to be sure of getting one
    private _getProvidersHoldingSelection(): IDataProvider[] {
        return [this._provider, ...this._provider.getGroupedRecordDataProviders(true)]
            .filter(provider => provider.getSelectedRecordIds({ includeChildrenRecordIds: false, includeGroupRecordIds: true }).length > 0);
    }

    /**
     * Re-applies a persisted selection once the rows it names are in the grid.
     *
     * Driven by the grid's own model rather than by polling for the records to turn up: a selection the
     * grid was opened with names records that may arrive with any page, or with a group's children, and a
     * row that is not there yet cannot be selected or scrolled to.
     */
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
        //per provider, because a selection spanning groups is held by the provider each row came from
        const providers = new Set(nodes.map(node => node.data!.getDataProvider()));
        for (const provider of providers) {
            provider.setSelectedRecordIds(Object.keys(provider.getRecordsMap()).filter(recordId => pendingRecordIds.has(recordId)));
        }
        this._scrollToSelection(nodes);
    }

    //the middle one rather than the first, so a run of selected rows is shown surrounded by its own context
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
