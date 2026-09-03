import { GridApi, IRowNode, RowDragEvent } from "@ag-grid-community/core";
import { EventEmitter, IRecord } from "@talxis/client-libraries";
import { ITaskDataProvider } from "@components/TaskGrid/providers/task";
import { INativeColumns, ITaskGridDatasetControl } from "@components/TaskGrid/interfaces";

interface IGridDragHandlerParameters {
    datasetControl: ITaskGridDatasetControl;
    gridApi: GridApi<IRecord>;
}

/** A drag in progress: the row being dragged, the row under it, and where in that row it hovers. */
export interface IDragOperation {
    overNode: IRowNode<IRecord>;
    draggedNode: IRowNode<IRecord>;
    dragOverSection: 'top' | 'middle' | 'bottom';
}

/** Events raised by {@link GridDragHandler}. */
interface IGridDragHandlerEvents {
    onDragEnd: (dragOperation: IDragOperation) => void;
}

/** Tracks row drag-and-drop over the grid and reports where a drop landed. */
export class GridDragHandler extends EventEmitter<IGridDragHandlerEvents> {
    private _gridApi: GridApi<IRecord>;
    private _dataProvider: ITaskDataProvider;
    private _dragOperation: IDragOperation | null = null;
    private _nativeColumns: INativeColumns;
    private _datasetControl: ITaskGridDatasetControl;
    
    constructor(parameters: IGridDragHandlerParameters) {
        super();
        this._gridApi = parameters.gridApi;
        this._dataProvider = parameters.datasetControl.getServices().get('taskDataProvider');
        this._datasetControl = parameters.datasetControl;
        this._nativeColumns = parameters.datasetControl.getServices().get('nativeColumns');
        this._gridApi.setGridOption('rowDragEntireRow', true);
        this._gridApi.setGridOption('onRowDragMove', (e) => this._onRowDragMove(e));
        this._gridApi.setGridOption('onRowDragEnd', (e) => this._onRowDragEnd(e));
        this._gridApi.setGridOption('onCellEditingStarted', () => this._gridApi.setGridOption('rowDragEntireRow', false));
        this._gridApi.setGridOption('onCellEditingStopped', () => this._toggleRowDragging());
        this._dataProvider.addEventListener('onBeforeNewDataLoaded', () => this._toggleRowDragging())
    }

    public getPendingDragOperation(): IDragOperation | null {
        return this._dragOperation;
    }

    private _determineDragOverSection(y: number, overNode?: IRowNode<IRecord>): IDragOperation['dragOverSection'] {
        const { rowHeight, rowTop } = overNode!;
        const rowY = y - rowTop!;
        const thirdHeight = rowHeight! / 3;

        if (rowY <= thirdHeight) {
            return 'top';
        } else if (rowY <= 2 * thirdHeight) {
            return 'middle'
        } else {
            return 'bottom';
        }
    }

    private _onRowDragEnd(e: RowDragEvent<IRecord, any>) {
        this.dispatchEvent('onDragEnd', this._dragOperation!);
        this._dragOperation = null;
        this._refreshRowClasses(e.overNode);
    }


    private _onRowDragMove(e: RowDragEvent<IRecord, any>) {
        const { overNode, node, y } = e;
        const dragOverSection = this._determineDragOverSection(y, overNode);
        setTimeout(() => {
            const currentOverNode = this._dragOperation?.overNode;
            if (currentOverNode === overNode && dragOverSection === 'middle' && !overNode?.expanded && this._dataProvider.getRecordTree().view.hasChildren(overNode!.data!.getRecordId())) {
                overNode?.setExpanded(true);
            }
        }, 1000);
        if (this._dragOperation && this._dragOperation.overNode !== overNode) {
            //remove the drag classes from the node we left
            this._refreshRowClasses(this._dragOperation.overNode);
        }
        this._dragOperation = {
            overNode: overNode!,
            draggedNode: node,
            dragOverSection: dragOverSection
        };
        this._refreshRowClasses(overNode);
    }

    private _refreshRowClasses(node?: IRowNode<IRecord>) {
        if (!node?.data) {
            return;
        }
        this._gridApi.applyTransactionAsync({
            update: [node.data]
        })
    }

    private _toggleRowDragging() {
        const sorting = this._dataProvider.getSorting();
        const isFlatListEnabled = this._dataProvider.isFlatListEnabled();
        const isSortedByNonStackRank = sorting.length > 0 && sorting[0].name !== this._nativeColumns.stackRank;
        const isRowDraggingEnabled = this._datasetControl.isRowDraggingEnabled();

        const canDrag = isRowDraggingEnabled && !isFlatListEnabled && !isSortedByNonStackRank;
        this._gridApi.setGridOption('rowDragEntireRow', canDrag);
    }
}