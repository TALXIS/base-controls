import { ColDef as ColDefBase, GridApi as GridApiBase, IRowNode, RowDragEvent } from "@ag-grid-community/core";
import { CellEditingStoppedEvent, CellFocusedEvent, CellValueChangedEvent } from "@ag-grid-community/core";
import { DataTypes, DatasetConstants, IDataProvider, IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { StackRank } from "@utils/stack-rank";
import { CompletionCell } from "../completion-cell";
import { DeleteCell } from "../delete-cell";
import { COMPLETED_CLASS_NAME, COMPLETION_COLUMN_NAME, CONTROL_COLUMN_WIDTH, DELETE_COLUMN_NAME, REORDERING_CLASS_NAME } from "../constants";
import { ICheckListDatasetControl } from "../../../CheckListDatasetControl";

/** AG Grid's `ColDef`, bound to the grid's record type. */
type ColDef = ColDefBase<IRecord>;
/** AG Grid's `GridApi`, bound to the grid's record type. */
type GridApi = GridApiBase<IRecord>;

/** Only used if a node cannot report its own height, which it always can in practice. */
const DEFAULT_ROW_HEIGHT = 42;

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
     * Intercepts `setGridOption` for the keys the checklist owns.
     *
     * `columnDefs` so the column configuration survives every data load: the grid pushes it from its own
     * init *and* from every new page, so computing it once here would be overwritten by the next refresh.
     */
    private _patchGridApi() {
        this._setGridOption = this._gridApi.setGridOption.bind(this._gridApi);
        this._gridApi.setGridOption = (key: any, value: any): void => {
            switch (key) {
                case 'columnDefs': {
                    this._setGridOption(key, this._getColumnDefinitions(value));
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
        //the grid adds a checkbox column whenever selection or editing is on, and editing is on here.
        //A checklist selects nothing, so the column only ever showed the per-row save status - dropped
        //rather than left as an empty gutter
        const definitions = columnDefs.filter(colDef => (colDef.colId ?? colDef.field) !== DatasetConstants.CHECKBOX_COLUMN_KEY);
        this._markCompletedNameCells(definitions);
        this._injectCompletionColumn(definitions);
        this._injectDeleteColumn(definitions);
        return definitions;
    }

    /**
     * Has the name cell of a finished item carry {@link COMPLETED_CLASS_NAME}, which is what strikes its
     * text through.
     *
     * A class rule rather than a class: the grid owns the name column's renderer, so the styling has to
     * come from the column definition, and it has to be re-decided per row. AG Grid re-evaluates the rule
     * when the cell is refreshed, which is what the checkbox asks for after it writes.
     */
    private _markCompletedNameCells(columnDefs: ColDef[]) {
        const { name, completed } = this._datasetControl.getFieldMapping();
        const nameColumnDef = columnDefs.find(colDef => (colDef.colId ?? colDef.field) === name);
        if (!nameColumnDef) {
            return;
        }
        nameColumnDef.cellClassRules = {
            //a TwoOptions field always reads back as the string '1' or '0'
            [COMPLETED_CLASS_NAME]: (params) => params.data?.getValue(completed) === '1'
        };
    }

    /**
     * Prepends the completion column. Guarded because this runs on every push of `columnDefs`, not once.
     *
     * `unshift` rather than `push`: order inside the pinned-left container follows the array, and `pinned`
     * alone puts a column in that container without making it first.
     */
    private _injectCompletionColumn(columnDefs: ColDef[]) {
        if (columnDefs.find(colDef => colDef.colId === COMPLETION_COLUMN_NAME)) {
            return;
        }
        columnDefs.unshift({
            colId: COMPLETION_COLUMN_NAME,
            headerName: '',
            width: CONTROL_COLUMN_WIDTH,
            minWidth: CONTROL_COLUMN_WIDTH,
            maxWidth: CONTROL_COLUMN_WIDTH,
            //AG Grid's colDef defaults are `{ resizable: true, sortable: true }`, so a column holding a
            //control opts into a resize handle and a sortable header unless both are said out loud
            resizable: false,
            sortable: false,
            suppressMovable: true,
            suppressSizeToFit: true,
            pinned: 'left',
            lockPinned: true,
            //`true` is 'left' - the opposite of the delete column's explicit 'right'
            lockPosition: true,
            //no `cellRendererParams`: the cell reads the column and its label off the control through
            //the context it renders in
            cellRenderer: CompletionCell
        });
    }

    /**
     * Appends the delete column. Guarded because this runs on every push of `columnDefs`, not once.
     *
     * Carries no `field` and no value pipeline on purpose: the grid attaches its `valueGetter`, `editable`
     * and `cellRendererParams` only to columns that came from the dataset, so a column added here is left
     * alone — not editable, no value read off the record. What it does *not* inherit is AG Grid's own
     * colDef defaults, which have to be turned off by hand below.
     */
    private _injectDeleteColumn(columnDefs: ColDef[]) {
        if (columnDefs.find(colDef => colDef.colId === DELETE_COLUMN_NAME)) {
            return;
        }
        columnDefs.push({
            colId: DELETE_COLUMN_NAME,
            headerName: '',
            width: CONTROL_COLUMN_WIDTH,
            minWidth: CONTROL_COLUMN_WIDTH,
            maxWidth: CONTROL_COLUMN_WIDTH,
            //both explicit: AG Grid's colDef defaults are `{ resizable: true, sortable: true }`, so a
            //column holding a button would otherwise get a resize handle and a sortable header
            resizable: false,
            sortable: false,
            suppressMovable: true,
            //the grid sizes its own columns to fit the viewport; without this the button column is
            //stretched to absorb the slack
            suppressSizeToFit: true,
            //sticky to the right edge, so the button stays reachable however far the list is scrolled
            pinned: 'right',
            //the user cannot drag it out of the pinned area
            lockPinned: true,
            //'right', not true - a plain `true` locks a column to the left
            lockPosition: 'right',
            cellRenderer: DeleteCell,
            cellRendererParams: {
                onDelete: this._deleteRecord,
                label: this._datasetControl.getLocalizationService().getLocalizedString('deleteItem')
            }
        });
    }

    /**
     * Confirms, deletes through the provider, then takes the row out of the grid.
     *
     * The provider goes first: a delete it refuses leaves the row on screen, and the store never ends up
     * disagreeing with the data. Removing from the store is what makes the row go without a refresh —
     * `deleteRecords` dispatches no events, so nothing else reacts on its own.
     */
    private _deleteRecord = async (record: IRecord) => {
        const localizationService = this._datasetControl.getLocalizationService();
        const confirmation = await this._datasetControl.getPcfContext().navigation.openConfirmDialog({
            text: localizationService.getLocalizedString('confirmDialog.deleteItem.text')
        });
        if (!confirmation.confirmed) {
            return;
        }
        const result = await this._dataProvider.deleteRecords([record.getRecordId()]);
        if (!result.success) {
            this._datasetControl.getPcfContext().navigation.openErrorDialog({
                message: localizationService.getLocalizedString('deletingItemError'),
                details: result.results.map(operation => operation.errorMessage).filter(Boolean).join('\n')
            });
            return;
        }
        this._gridApi.applyServerSideTransaction({ remove: [record] });
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

    /**
     * Marks the grid as mid-reorder. The row transition hangs off this class rather than being always on:
     * the grid rewrites row transforms as it recycles rows while scrolling, and a permanent transition
     * makes every one of those animate — which reads as the whole list moving in slow motion.
     */
    private _setReordering(reordering: boolean) {
        this._gridRoot?.classList.toggle(REORDERING_CLASS_NAME, reordering);
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
        this._setReordering(true);
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
        //read before the move: the focused cell is tracked by row index, and the transactions below
        //change which row sits at that index
        const focusedColumn = this._gridApi.getFocusedCell()?.column;
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

        //the drag is over: the transition comes off before the store moves the row, so the grid's own
        //repositioning is not animated
        this._setReordering(false);
        //the store still holds the old order, so it is moved now that the drop is final. Its own
        //repositioning of every row is what clears the preview offsets
        this._gridApi.applyServerSideTransaction({ remove: [record] });
        this._gridApi.applyServerSideTransaction({ add: [record], addIndex: targetIndex });
        this._dragStartIndex = null;
        this._currentIndex = null;

        //the focus follows the row rather than the position. The grid holds it as an index, so after the
        //move it would still point at the slot the row came from - which now holds a different item, and
        //reads as the highlight jumping back to where the drag started
        if (focusedColumn) {
            //deferred for the same reason the post-create focus is: the row has to exist at its new
            //index before it can be focused there
            setTimeout(() => this._gridApi.setFocusedCell(targetIndex, focusedColumn), 0);
        }

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
        //only the rendered rows: the grid virtualises, so most of a long list has no element to move.
        //One query for the whole reflow rather than one per row - this runs on every row crossed
        const elementsByRecordId = this._getRenderedRowElements();
        for (const node of this._gridApi.getRenderedNodes()) {
            const recordId = node.data?.getRecordId();
            if (node.rowIndex === null || node.rowPinned || !recordId) {
                continue;
            }
            const offset = this._getPreviewSlot(node.rowIndex, startIndex, targetIndex) * this._rowHeight;
            for (const element of elementsByRecordId.get(recordId) ?? []) {
                element.style.transform = `translateY(${offset}px)`;
            }
        }
    }

    /**
     * Every rendered row's elements, keyed by record id. A row is drawn once per column container — the
     * pinned ones carry the checkbox and the delete button — so all of them have to move together.
     */
    private _getRenderedRowElements(): Map<string, HTMLElement[]> {
        const elementsByRecordId = new Map<string, HTMLElement[]>();
        if (!this._gridRoot) {
            return elementsByRecordId;
        }
        for (const element of this._gridRoot.querySelectorAll<HTMLElement>('.ag-row[row-id]')) {
            const recordId = element.getAttribute('row-id')!;
            const elements = elementsByRecordId.get(recordId);
            elements ? elements.push(element) : elementsByRecordId.set(recordId, [element]);
        }
        return elementsByRecordId;
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
        this._setReordering(false);
        const elementsByRecordId = this._getRenderedRowElements();
        for (const node of this._gridApi.getRenderedNodes()) {
            const recordId = node.data?.getRecordId();
            if (node.rowIndex === null || node.rowPinned || !recordId) {
                continue;
            }
            for (const element of elementsByRecordId.get(recordId) ?? []) {
                element.style.transform = `translateY(${node.rowIndex * this._rowHeight}px)`;
            }
        }
        this._dragStartIndex = null;
        this._currentIndex = null;
    }


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
                    raw: this._datasetControl.getLocalizationService().getLocalizedString('newItemPlaceholder'),
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
        //the delete column holds a button, not a value - there is nothing to edit in it
        if (!colKey || colKey === DELETE_COLUMN_NAME) {
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

        this._gridApi.applyServerSideTransaction({ add: [record], addIndex: rowCount });

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

}
