import { ColDef as ColDefBase, GridApi as GridApiBase, IRowNode, RowDragEvent } from "@ag-grid-community/core";
import { DatasetConstants, IDataProvider, IRecord } from "@talxis/client-libraries";
import { StackRank } from "@utils/stack-rank";
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

    constructor(parameters: ICheckListGridCustomizerParameters) {
        this._gridApi = parameters.gridApi;
        this._datasetControl = parameters.datasetControl;
        this._patchGridApi();
        this._enableRowDragging();
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
        const originalSetGridOption = this._gridApi.setGridOption.bind(this._gridApi);
        this._gridApi.setGridOption = (key: any, value: any): void => {
            switch (key) {
                case 'columnDefs': {
                    originalSetGridOption(key, this._getColumnDefinitions(value));
                    break;
                }
                case 'animateRows': {
                    //what makes a reordered row slide to its new place instead of jumping
                    originalSetGridOption(key, true);
                    break;
                }
                default: {
                    originalSetGridOption(key, value);
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
        this._gridApi.setGridOption('rowDragEntireRow', true);
        this._gridApi.setGridOption('onRowDragEnter', (event: RowDragEvent<IRecord>) => this._onRowDragEnter(event));
        this._gridApi.setGridOption('onRowDragMove', (event: RowDragEvent<IRecord>) => this._onRowDragMove(event));
        this._gridApi.setGridOption('onRowDragLeave', () => this._previewOrder(this._dragStartIndex));
        this._gridApi.setGridOption('onRowDragEnd', (event: RowDragEvent<IRecord>) => this._onRowDragEnd(event));
        //a drag that starts inside an open cell editor would fight the editor for the mouse
        this._gridApi.setGridOption('onCellEditingStarted', () => this._gridApi.setGridOption('rowDragEntireRow', false));
        this._gridApi.setGridOption('onCellEditingStopped', () => this._gridApi.setGridOption('rowDragEntireRow', true));
    }

    private _onRowDragEnter(event: RowDragEvent<IRecord>) {
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
    private _getRowElements(index: number): HTMLElement[] {
        const recordId = this._gridApi.getDisplayedRowAtIndex(index)?.data?.getRecordId();
        if (!recordId || !this._gridRoot) {
            return [];
        }
        return [...this._gridRoot.querySelectorAll<HTMLElement>(`.ag-row[row-id="${recordId}"]`)];
    }
}
