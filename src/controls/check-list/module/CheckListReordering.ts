import { GridApi, IRowDragItem, RowDragEndEvent, RowDragEnterEvent } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { StackRank } from "@utils/stack-rank";
import { IGridAgGridInitialOptions, IGridAgGridOptions, IGridRuntime } from "../../grid/services/runtime";
import { IGridEditedCell } from "../../grid/modules/editing";
import { IGridCheckList } from "./GridCheckList";
import { IGridStyles } from "../../grid/services/theme";
import { getCheckListReorderingStyles } from "./styles";

export interface ICheckListReorderingParameters {
    runtime: IGridRuntime;
    checkList: IGridCheckList;
}

/** Items reorder by dragging anywhere on their row, and the drop is saved as the item's stack rank. */
export class CheckListReordering {
    private _runtime: IGridRuntime;
    private _checkList: IGridCheckList;
    private _isEditing = false;
    //the item being dragged, until a drop in the grid settles where it goes
    private _draggedRecord?: IRecord;

    constructor(parameters: ICheckListReorderingParameters) {
        this._runtime = parameters.runtime;
        this._checkList = parameters.checkList;
        this._runtime.registerAgGridInitialOptions(this._onAgGridInitialOptions);
        this._runtime.registerAgGridOptions(this._onAgGridOptions);
        this._runtime.services.get('gridTheme').registerStyles(this._onStyles);
        this._runtime.services.get('editing').events.addEventListener('onEditedCellChanged', this._onEditedCellChanged);
        this._runtime.services.whenAvailable('gridApi', this._onGridApiAvailable);
    }

    private _onAgGridInitialOptions = (result: IGridAgGridInitialOptions): void => {
        result.options.rowDragText = this._getRowDragText;
    };

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.rowDragManaged = true;
        result.options.rowDragEntireRow = true;
        result.options.animateRows = true;
        //a drag that starts inside an open editor fights the editor for the mouse
        result.options.suppressRowDrag = this._isEditing;
    };

    private _onStyles = (result: IGridStyles): void => {
        result.styles.push(getCheckListReorderingStyles());
    };

    private _getRowDragText = (params: IRowDragItem): string => {
        return params.rowNode?.data?.getFormattedValue(this._checkList.getFieldMapping().name) ?? '';
    };

    private _onEditedCellChanged = (_previous: IGridEditedCell | undefined, next: IGridEditedCell | undefined): void => {
        if (this._isEditing !== !!next) {
            this._isEditing = !!next;
            this._runtime.refreshAgGridOptions();
        }
    };

    private _onGridApiAvailable = (gridApi: GridApi<IRecord>): void => {
        gridApi.addEventListener('rowDragEnter', this._onRowDragEnter);
        gridApi.addEventListener('rowDragEnd', this._onRowDragEnd);
        //fired on every mouse up of a drag, after rowDragEnd when the drop landed in the grid
        gridApi.addEventListener('dragStopped', this._restoreDraggedRow);
        gridApi.addEventListener('rowDragCancel', this._restoreDraggedRow);
    };

    private _onRowDragEnter = (event: RowDragEnterEvent<IRecord>): void => {
        this._draggedRecord ??= event.node.data;
    };

    //AG Grid fires this before it applies the drop
    private _onRowDragEnd = (event: RowDragEndEvent<IRecord>): void => {
        this._draggedRecord = undefined;
        queueMicrotask(() => this._rankDroppedRow(event));
    };

    //a drag that ends outside the grid has still moved its row
    private _restoreDraggedRow = (): void => {
        const record = this._draggedRecord;
        this._draggedRecord = undefined;
        const gridApi = this._runtime.services.find('gridApi');
        if (!record || !gridApi) {
            return;
        }
        const stackRank = this._checkList.getFieldMapping().stackRank;
        let index = 0;
        gridApi.forEachNode(node => {
            if (node.data && node.data !== record && StackRank.compare(node.data.getValue(stackRank), record.getValue(stackRank)) < 0) {
                index++;
            }
        });
        gridApi.applyTransaction({ remove: [record] });
        gridApi.applyTransaction({ add: [record], addIndex: index });
    };

    private _rankDroppedRow(event: RowDragEndEvent<IRecord>): void {
        const { node, api } = event;
        if (!node.data || node.rowPinned || node.rowIndex === null) {
            return;
        }
        const stackRank = this._checkList.getFieldMapping().stackRank;
        const previousRank = api.getDisplayedRowAtIndex(node.rowIndex - 1)?.data?.getValue(stackRank);
        const nextRank = api.getDisplayedRowAtIndex(node.rowIndex + 1)?.data?.getValue(stackRank);
        if (!this._isBetween(node.data.getValue(stackRank), previousRank, nextRank)) {
            this._runtime.services.get('fields').get(node.data, stackRank).setValue(StackRank.between(previousRank, nextRank));
        }
    }

    private _isBetween(rank: string, previousRank?: string, nextRank?: string): boolean {
        return (!previousRank || StackRank.compare(previousRank, rank) < 0) && (!nextRank || StackRank.compare(rank, nextRank) < 0);
    }
}
