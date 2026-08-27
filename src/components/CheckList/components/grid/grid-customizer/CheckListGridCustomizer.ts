import { ColDef as ColDefBase, GridApi as GridApiBase, IRowNode, RowDragEvent } from "@ag-grid-community/core";
import { CellEditingStoppedEvent, CellFocusedEvent, CellValueChangedEvent } from "@ag-grid-community/core";
import { DataTypes, DatasetConstants, IDataProvider, IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { StackRank } from "@utils/stack-rank";
import { ICheckListDatasetControl } from "../../../CheckListDatasetControl";

/** AG Grid's `ColDef`, bound to the grid's record type. */
type ColDef = ColDefBase<IRecord>;
/** AG Grid's `GridApi`, bound to the grid's record type. */
type GridApi = GridApiBase<IRecord>;

/** Only used if a node cannot report its own height, which it always can in practice. */
const DEFAULT_ROW_HEIGHT = 42;

/** What the new-record row shows instead of the empty-value dashes. */
const NEW_ITEM_PLACEHOLDER = 'Add an item';

/** What {@link CheckListGridCustomizer} is built from. */
export interface ICheckListGridCustomizerParameters {
    gridApi: GridApi;
    datasetControl: ICheckListDatasetControl;
}

/**
 * Where the checklist configures its own AG Grid instance. Internal: there is no strategy, no module and
 * no prop behind this — it is not a seam for consumers, it is how the checklist implements itself.
 *
 * Built in the grid's `onGridReady`, before the grid pushes its first columns.
 *
 * Adds no listeners to the data provider, and should not: the checklist never remounts and leaves the
 * provider alive on unmount (`DestroyDatasetOnUnmount` is false, the caller owns it), so a listener
 * registered here would outlive the grid and pile up across mounts. The grid options and the patched
 * `gridApi` are safe because they die with the AG Grid instance.
 */
export class CheckListGridCustomizer {
    private _gridApi: GridApi;
    private _datasetControl: ICheckListDatasetControl;
    /** The row being dragged, and where it sat when the drag started, so a cancelled drag can undo. */
    private _draggedNode: IRowNode<IRecord> | null = null;
    private _dragStartIndex: number | null = null;
    private _rowHeight: number = DEFAULT_ROW_HEIGHT;
    /** The grid's DOM root, taken off the drag event — neither the api nor the node exposes one. */
    private _gridRoot: HTMLElement | null = null;
    /**
     * Where the dragged row sits now. Tracked here rather than read back off the node: removing a row
     * from the store detaches its node and leaves `rowIndex` null, so the node cannot answer this
     * question after the first move.
     */
    private _currentIndex: number | null = null;
    /**
     * The record behind the pinned new-record row, and the throwaway provider that owns it. Own provider
     * on purpose: the grid saves every cell edit as it is made, and a draft owned by the real provider
     * would push a half-typed item at the consumer's backend on the first keystroke. A memory provider's
     * save is a no-op, so nothing leaves the grid until the row is committed here.
     */
    private _draftProvider: MemoryDataProvider | null = null;
    private _draft: IRecord | null = null;
    /** The unpatched setter, for writes that must not run back through the patch. */
    private _setGridOption!: GridApi['setGridOption'];
    /** Mirrors the `rowDragEntireRow` option, so it is only written when it actually changes. */
    private _isRowDragEnabled: boolean = false;


    constructor(parameters: ICheckListGridCustomizerParameters) {
        this._gridApi = parameters.gridApi;
        this._datasetControl = parameters.datasetControl;
        this._patchGridApi();
        this._enableRowDragging();
        this._enableNewRecordRow();
    }

    private get _dataProvider(): IDataProvider {
        return this._datasetControl.getDataset().getDataProvider();
    }

    /**
     * Intercepts `setGridOption` for the two keys the checklist owns.
     *
     * `columnDefs` so the column configuration survives every data load: the grid pushes it from its own
     * init *and* from every new page, so computing it once here would be overwritten by the next refresh.
     *
     * `animateRows` because the base grid model hard-codes it to `false` for every grid in the repo, from
     * an `init()` that runs *after* this constructor. Setting it here directly would be overwritten a
     * moment later; intercepting is what holds, and it confines the change to this grid.
     */
    private _patchGridApi() {
        this._setGridOption = this._gridApi.setGridOption.bind(this._gridApi);
        this._gridApi.setGridOption = (key: any, value: any): void => {
            switch (key) {
                case 'columnDefs': {
                    this._setGridOption(key, this._getColumnDefinitions(value));
                    break;
                }
                case 'animateRows': {
                    //what makes a reordered row slide to its new place instead of jumping
                    this._setGridOption(key, true);
                    break;
                }
                case 'pinnedBottomRowData': {
                    //the checklist owns this row. The base grid pushes its total row here on first data
                    //load, which would drop the new-record row - and a total row is never configured for
                    //a checklist, so whatever it wanted is discarded rather than merged
                    this._applyPinnedBottomRow();
                    break;
                }
                default: {
                    this._setGridOption(key, value);
                }
            }
        }
    }

    /** The checklist's own column configuration. Runs on every push of `columnDefs`. */
    private _getColumnDefinitions(columnDefs: ColDef[]): ColDef[] {
        for (const colDef of columnDefs) {
            const columnName = (colDef.colId ?? colDef.field) as string;
            switch (columnName) {
                case DatasetConstants.CHECKBOX_COLUMN_KEY: {
                    //the tick column leads the list and stays there - it is not one of the data columns
                    colDef.lockPosition = true;
                    break;
                }
            }
        }
        return columnDefs;
    }

    /**
     * Rows reorder by dragging anywhere on them.
     *
     * Unmanaged: AG Grid's own managed dragging reorders by moving the node inside the client side row
     * model, and this grid is server side. Rather than move the row in the store as the drag goes — which
     * destroys and recreates its node, losing both the `ag-row-dragging` styling that shows which row is
     * in your hand and any chance of the element transitioning — the store is left alone until the drop
     * and the reorder is previewed by offsetting the rows.
     */
    private _enableRowDragging() {
        this._setRowDragEnabled(true);
        this._gridApi.setGridOption('onRowDragEnter', (event: RowDragEvent<IRecord>) => this._onRowDragEnter(event));
        this._gridApi.setGridOption('onRowDragMove', (event: RowDragEvent<IRecord>) => this._onRowDragMove(event));
        this._gridApi.setGridOption('onRowDragLeave', () => this._previewOrder(this._dragStartIndex));
        this._gridApi.setGridOption('onRowDragEnd', (event: RowDragEvent<IRecord>) => this._onRowDragEnd(event));
        //a drag that starts inside an open cell editor would fight the editor for the mouse. The matching
        //re-enable lives in _onCellEditingStopped, which the new-record row shares - one grid option, one
        //handler, or whichever was registered second would silently drop the other
        this._gridApi.setGridOption('onCellEditingStarted', () => this._setRowDragEnabled(false));
    }

    /** The one writer of `rowDragEntireRow`; toggling it rebuilds every row's dragger, so only on change. */
    private _setRowDragEnabled(enabled: boolean) {
        if (this._isRowDragEnabled === enabled) {
            return;
        }
        this._isRowDragEnabled = enabled;
        this._gridApi.setGridOption('rowDragEntireRow', enabled);
    }

    private _onRowDragEnter(event: RowDragEvent<IRecord>) {
        //the new-record row is not one of the items: it has no rank and reorders nothing. AG Grid offers
        //no per-row veto once `rowDragEntireRow` is on - it gives every row a dragger, pinned included -
        //so the drag is made inert here instead
        if (event.node.rowPinned) {
            return;
        }
        this._draggedNode = event.node;
        this._dragStartIndex = event.node.rowIndex;
        this._currentIndex = event.node.rowIndex;
        this._rowHeight = event.node.rowHeight ?? DEFAULT_ROW_HEIGHT;
        //the only handle on the grid's DOM: the node carries no element, and the api exposes none
        this._gridRoot = (event.event?.target as HTMLElement | null)?.closest('.ag-root') ?? null;
    }

    /**
     * Offsets the rows so the gap follows the cursor. Only a change of slot does anything, which keeps
     * this to one reflow per row crossed rather than one per mouse event.
     */
    private _onRowDragMove(event: RowDragEvent<IRecord>) {
        if (!this._draggedNode || event.overIndex < 0 || event.overIndex === this._currentIndex) {
            return;
        }
        this._previewOrder(event.overIndex);
    }

    /** Commits the order the rows are already showing as the record's new rank. */
    private async _onRowDragEnd(event: RowDragEvent<IRecord>) {
        const draggedNode = this._draggedNode;
        const startIndex = this._dragStartIndex;
        const targetIndex = this._currentIndex;
        const record = draggedNode?.data;
        this._draggedNode = null;

        if (!record || targetIndex === null || startIndex === null || event.overIndex < 0) {
            this._previewOrder(startIndex);
            return;
        }
        if (targetIndex === startIndex) {
            //dropped where it started: nothing moved, so there is no rank to write
            this._clearPreview();
            return;
        }
        const [previousRecord, nextRecord] = this._getNeighboursAt(targetIndex, startIndex);
        const stackRankColumn = this._datasetControl.getFieldMapping().stackRank;

        //the store still holds the old order, so it is moved now that the drop is final. Its own
        //repositioning of every row is what clears the preview offsets
        this._gridApi.applyServerSideTransaction({ remove: [record] });
        this._gridApi.applyServerSideTransaction({ add: [record], addIndex: targetIndex });
        this._dragStartIndex = null;
        this._currentIndex = null;

        record.setValue(stackRankColumn, StackRank.between(
            previousRecord?.getValue(stackRankColumn),
            nextRecord?.getValue(stackRankColumn)
        ));
        //explicitly: the grid saves an edit made through a cell editor, but nothing saves a value set
        //from code, and `autoSave` only decides whether the ribbon offers a save command
        await record.save();
    }

    /**
     * The records either side of the dragged row once it sits at `targetIndex` — read off the order the
     * rows are showing, not the store, which is still in its pre-drop order.
     */
    private _getNeighboursAt(targetIndex: number, startIndex: number): [IRecord | undefined, IRecord | undefined] {
        const records: IRecord[] = [];
        for (let index = 0; index < this._gridApi.getDisplayedRowCount(); index++) {
            const record = this._gridApi.getDisplayedRowAtIndex(index)?.data;
            if (record) {
                records.push(record);
            }
        }
        const [dragged] = records.splice(startIndex, 1);
        records.splice(targetIndex, 0, dragged);
        return [records[targetIndex - 1], records[targetIndex + 1]];
    }

    /**
     * Slides every row to the slot it would occupy with the dragged row at `targetIndex`. The dragged
     * row keeps its node throughout, so it keeps the `ag-row-dragging` styling that marks it as the one
     * being moved, and every row animates because only its transform changes.
     */
    private _previewOrder(targetIndex: number | null) {
        const startIndex = this._dragStartIndex;
        if (targetIndex === null || startIndex === null) {
            return;
        }
        this._currentIndex = targetIndex;
        for (let index = 0; index < this._gridApi.getDisplayedRowCount(); index++) {
            const offset = this._getPreviewSlot(index, startIndex, targetIndex) * this._rowHeight;
            for (const element of this._getRowElements(index)) {
                element.style.transform = `translateY(${offset}px)`;
            }
        }
    }

    /** Where a row sits while the preview is showing: the dragged row leads, the rows it passed shift. */
    private _getPreviewSlot(index: number, startIndex: number, targetIndex: number): number {
        if (index === startIndex) {
            return targetIndex;
        }
        if (startIndex < targetIndex && index > startIndex && index <= targetIndex) {
            return index - 1;
        }
        if (startIndex > targetIndex && index >= targetIndex && index < startIndex) {
            return index + 1;
        }
        return index;
    }

    /** Drops the preview and puts every row back on its real slot. */
    private _clearPreview() {
        for (let index = 0; index < this._gridApi.getDisplayedRowCount(); index++) {
            for (const element of this._getRowElements(index)) {
                element.style.transform = `translateY(${index * this._rowHeight}px)`;
            }
        }
        this._dragStartIndex = null;
        this._currentIndex = null;
    }

    /**
     * Every element the row is drawn as. A row is rendered once per column container — the pinned left
     * one carries the checkbox — so offsetting only the centre one leaves the tick behind.
     */
    /**
     * A permanently visible row pinned below the list. Naming an item in it creates that item at the end
     * of the list and readies the row for the next one.
     */
    private _enableNewRecordRow() {
        this._resetDraft();
        //also carries the drag re-enable - see _onCellEditingStopped
        this._gridApi.setGridOption('onCellEditingStopped', (event: CellEditingStoppedEvent<IRecord>) => this._onCellEditingStopped(event));
        this._gridApi.setGridOption('onCellFocused', (event: CellFocusedEvent<IRecord>) => this._onCellFocused(event));
        this._gridApi.setGridOption('onCellValueChanged', (event: CellValueChangedEvent<IRecord>) => this._onCellValueChanged(event));
    }

    /** Builds a blank draft and hands it to the grid as the pinned row. */
    private _resetDraft() {
        const provider = this._dataProvider;
        this._draftProvider = new MemoryDataProvider({
            dataSource: [],
            metadata: provider.getMetadata() as any,
        });
        //the real columns, so the draft's cells render and edit exactly like the list's own
        this._draftProvider.setColumns(provider.getColumns());
        //newRecord, not getRecords: a provider that has not refreshed yet holds no raw records, so
        //getRecords would answer with an empty array and the pinned row would carry undefined
        this._draft = this._draftProvider.newRecord();
        //the row exists only to be typed into, so its editor says so rather than showing empty-value
        //dashes. Set per draft rather than once: the expression lives on the record's own field, and
        //every reset builds a new record
        this._draft.expressions.ui.setControlParametersExpression(
            this._datasetControl.getFieldMapping().name,
            (parameters) => ({
                ...parameters,
                Placeholder: {
                    raw: NEW_ITEM_PLACEHOLDER,
                    type: DataTypes.SingleLineText
                }
            })
        );
        this._applyPinnedBottomRow();
    }

    /** Writes the new-record row as the grid's only pinned bottom row. */
    private _applyPinnedBottomRow() {
        this._setGridOption('pinnedBottomRowData', this._draft ? [this._draft] : []);
    }

    /**
     * The grid re-renders an edited cell by looking its row up in the row model, and a pinned row is not
     * in it — its node id is `b-0`, not a record id. Without this the draft's cells keep showing the
     * value they held before the edit.
     */
    private _onCellValueChanged(event: CellValueChangedEvent<IRecord>) {
        if (event.rowPinned !== 'bottom') {
            return;
        }
        const node = this._gridApi.getPinnedBottomRow(0);
        if (node) {
            this._gridApi.refreshCells({ rowNodes: [node], force: true });
        }
    }

    /**
     * The new-record row exists only to be typed into, so focusing one of its cells opens the editor
     * there and then — no double click, and the row always shows editors rather than read-only values.
     *
     * Done here rather than with the column's own `oneClickEdit`, which is read off the column object
     * every row shares and would turn the whole list into live inputs.
     */
    private _onCellFocused(event: CellFocusedEvent<IRecord>) {
        if (event.rowPinned !== 'bottom' || event.rowIndex === null || event.rowIndex === undefined) {
            return;
        }
        const colKey = typeof event.column === 'string' ? event.column : event.column?.getColId();
        if (!colKey) {
            return;
        }
        //startEditingCell focuses the cell in turn, so without this the two would call each other for ever
        const isEditing = this._gridApi.getEditingCells().some(cell =>
            cell.rowPinned === 'bottom' && cell.column.getColId() === colKey);
        if (isEditing) {
            return;
        }
        this._gridApi.startEditingCell({
            rowIndex: event.rowIndex,
            rowPinned: 'bottom',
            colKey: colKey
        });
    }

    /**
     * Shared by both features: dragging is suspended while an editor is open and resumes here, and on the
     * pinned row naming the item is what commits it. The other mapped fields stay optional.
     */
    private _onCellEditingStopped(event: CellEditingStoppedEvent<IRecord>) {
        this._setRowDragEnabled(true);
        if (event.rowPinned !== 'bottom') {
            return;
        }
        const nameColumn = this._datasetControl.getFieldMapping().name;
        const name = this._draft?.getValue(nameColumn);
        if (name === null || name === undefined || name === '') {
            return;
        }
        this._commitDraft();
    }

    /** Turns the draft into a real record at the end of the list, then starts a fresh draft. */
    private async _commitDraft() {
        const draft = this._draft;
        if (!draft) {
            return;
        }
        const provider = this._dataProvider;
        const stackRankColumn = this._datasetControl.getFieldMapping().stackRank;
        const rowCount = this._gridApi.getDisplayedRowCount();
        const lastRecord = rowCount > 0 ? this._gridApi.getDisplayedRowAtIndex(rowCount - 1)?.data : undefined;

        const rawData = draft.toRawData();
        //appended: a rank after the last item, which `between` resolves with no next neighbour
        rawData[stackRankColumn] = StackRank.between(lastRecord?.getValue(stackRankColumn), undefined);

        //no recordId, so the provider assigns one and treats it as new
        const record = provider.newRecord({ rawData: rawData });
        //a fresh draft immediately, so the row is ready to type in while the save is still in flight
        this._resetDraft();

        const result = this._gridApi.applyServerSideTransaction({ add: [record], addIndex: rowCount });
        //after the transaction, so the node exists to flash
        if (result?.add?.length) {
            this._gridApi.flashCells({ rowNodes: result.add });
        }

        //both deferred, and for the same reason: the transaction has been applied but the grid has not
        //yet recomputed row bounds or rebuilt the pinned row, so neither the new row can be scrolled to
        //nor the draft's cell edited until it has. The task grid defers its own post-create focus too
        setTimeout(() => {
            //the item is appended, so on a list taller than the viewport it lands below the fold
            this._gridApi.ensureIndexVisible(rowCount, 'bottom');
            this._startEditingDraft();
        }, 0);
        await record.save();
    }

    /** Puts the caret back in the draft's name cell so several items can be added without the mouse. */
    private _startEditingDraft() {
        this._gridApi.startEditingCell({
            rowIndex: 0,
            rowPinned: 'bottom',
            colKey: this._datasetControl.getFieldMapping().name
        });
    }

    private _getRowElements(index: number): HTMLElement[] {
        const recordId = this._gridApi.getDisplayedRowAtIndex(index)?.data?.getRecordId();
        if (!recordId || !this._gridRoot) {
            return [];
        }
        return [...this._gridRoot.querySelectorAll<HTMLElement>(`.ag-row[row-id="${recordId}"]`)];
    }
}
