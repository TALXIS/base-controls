import { GridApi, IRowNode, RowDragEvent } from "@ag-grid-community/core";
import { EventEmitter, IRecord } from "@talxis/client-libraries";
import { ITaskDataProvider } from "../../../data-providers/task-data-provider";
import { ISourceDataProvider } from "../../../data-providers/source-data-provider";
import { INativeColumns, ITaskGridDatasetControl } from "../../../interfaces";

interface IGridDragHandlerOptions {
    datasetControl: ITaskGridDatasetControl;
    gridApi: GridApi<IRecord>;
}

export interface IDragOperation {
    overNode: IRowNode<IRecord>;
    draggedNode: IRowNode<IRecord>;
    dragOverSection: 'top' | 'middle' | 'bottom';
}

interface IGridDragHandlerEvents {
    onGragEnd: (dragOperation: IDragOperation) => void;
}

export class GridDragHandler extends EventEmitter<IGridDragHandlerEvents> {
    private _gridApi: GridApi<IRecord>;
    private _dataProvider: ITaskDataProvider;
    private _dragOperation: IDragOperation | null = null;
    private _nativeColumns: INativeColumns;
    private _datasetControl: ITaskGridDatasetControl;
    
    constructor(options: IGridDragHandlerOptions) {
        super();
        this._gridApi = options.gridApi;
        this._dataProvider = options.datasetControl.getDataProvider();
        this._datasetControl = options.datasetControl;
        this._nativeColumns = options.datasetControl.getNativeColumns();
        this._gridApi.setGridOption('rowDragEntireRow', true);
        this._gridApi.setGridOption('onRowDragMove', (e) => this._onRowDragMove(e));
        this._gridApi.setGridOption('onRowDragEnd', (e) => this._onRowDragEnd(e));
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
        this.dispatchEvent('onGragEnd', this._dragOperation!);
        this._dragOperation = null;
        this._refreshRowClasses(e.overNode);
    }


    private _onRowDragMove(e: RowDragEvent<IRecord, any>) {
        const { overNode, node, y } = e;
        const dragOverSection = this._determineDragOverSection(y, overNode);
        setTimeout(() => {
            const currentOverNode = this._dragOperation?.overNode;
            if (currentOverNode === overNode && dragOverSection === 'middle' && !overNode?.expanded && this._dataProvider.getRecordTree().hasChildren(overNode!.data!.getRecordId())) {
                overNode?.setExpanded(true);
            }
        }, 1000);
        if (this._dragOperation && this._dragOperation.overNode !== overNode) {
            // Refresh previous over node to remove drag classes
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
        if (!node) {
            return;
        }
        //@ts-ignore - typings - getGroupKeys missing in type
        const keys = [...node.getGroupKeys()].slice(0, -1);
        this._gridApi.applyServerSideTransactionAsync({
            route: keys,
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