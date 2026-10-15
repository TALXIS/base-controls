import { IRecord } from "@talxis/client-libraries";
import { GridApi, IRowNode, RowDragEvent } from "ag-grid-community";
import type { ITaskDataProvider, ITaskMovePosition } from "../provider";
import type { ITaskGridServiceLocator } from "../services";

/** Where in the row under the pointer a dragged task hovers. */
export type ITaskDragSection = 'top' | 'middle' | 'bottom';

interface IDragOperation {
    draggedNode: IRowNode<IRecord>;
    overNode: IRowNode<IRecord>;
    section: ITaskDragSection;
}

export interface ITaskTreeDraggingParameters {
    services: ITaskGridServiceLocator;
    onIsEnabled: () => boolean;
}

const AUTO_EXPAND_DELAY = 1000;

/** Moves a task where the user drops its row: above, below or into another task. */
export class TaskTreeDragging {
    private _services: ITaskGridServiceLocator;
    private _onIsEnabled: () => boolean;
    private _operation: IDragOperation | null = null;
    private _isEditing = false;
    private _autoExpandTimeout?: ReturnType<typeof setTimeout>;

    constructor(parameters: ITaskTreeDraggingParameters) {
        this._services = parameters.services;
        this._onIsEnabled = parameters.onIsEnabled;
        this._services.get('grid').events.addEventListener('onDestroyed', () => clearTimeout(this._autoExpandTimeout));
    }

    public attach(gridApi: GridApi<IRecord>): void {
        gridApi.addEventListener('rowDragMove', this._onRowDragMove);
        gridApi.addEventListener('rowDragEnd', this._onRowDragEnd);
        gridApi.addEventListener('rowDragLeave', this._onRowDragLeave);
        gridApi.addEventListener('cellEditingStarted', this._onCellEditingChanged);
        gridApi.addEventListener('cellEditingStopped', this._onCellEditingChanged);
    }

    /** Whether rows can be dragged: not in a view sorted by something else, or while editing. */
    public canDrag(): boolean {
        const sorting = this._provider.getSorting();
        const isSortedByOtherColumn = sorting.length > 0 && sorting[0].name !== this._provider.getFieldMapping().stackRank;
        return this._onIsEnabled() && !this._isEditing && !isSortedByOtherColumn;
    }

    /** Where the dragged task hovers over this record's row, if it does. */
    public getDragSection(record: IRecord): ITaskDragSection | null {
        const operation = this._operation;
        if (!operation || operation.overNode.data !== record || operation.overNode === operation.draggedNode) {
            return null;
        }
        return operation.section;
    }

    private _onRowDragMove = (event: RowDragEvent<IRecord>): void => {
        const overNode = event.overNode;
        if (!overNode?.data) {
            return;
        }
        const section = this._getSection(event.y, overNode);
        const previous = this._operation;
        this._operation = { draggedNode: event.node, overNode, section };
        if (previous?.overNode === overNode && previous.section === section) {
            return;
        }
        this._refreshRowClasses([previous?.overNode.data, overNode.data]);
        clearTimeout(this._autoExpandTimeout);
        if (section === 'middle') {
            this._autoExpandTimeout = setTimeout(() => this._autoExpand(overNode), AUTO_EXPAND_DELAY);
        }
    };

    private _onRowDragEnd = (): void => {
        const operation = this._operation;
        this._clear();
        if (operation && this._isAllowed(operation)) {
            this._provider.moveTask(operation.draggedNode.id!, operation.overNode.id!, this._getPosition(operation.section));
        }
    };

    private _onRowDragLeave = (): void => this._clear();

    private _onCellEditingChanged = (event: { type: string }): void => {
        this._isEditing = event.type === 'cellEditingStarted';
        this._services.get('grid').refreshAgGridOptions();
    };

    private _clear(): void {
        clearTimeout(this._autoExpandTimeout);
        const overRecord = this._operation?.overNode.data;
        this._operation = null;
        this._refreshRowClasses([overRecord]);
    }

    private _autoExpand(overNode: IRowNode<IRecord>): void {
        const recordId = overNode.data?.getRecordId();
        if (this._operation?.overNode === overNode && recordId && this._provider.getRecordTree().view.hasChildren(recordId)) {
            this._services.get('taskExpansion').setExpanded(recordId, true);
        }
    }

    private _isAllowed(operation: IDragOperation): boolean {
        const { draggedNode, overNode, section } = operation;
        if (draggedNode === overNode || (section === 'middle' && !this._provider.isRecordActive(overNode.id!))) {
            return false;
        }
        for (let parent = overNode.parent; parent; parent = parent.parent) {
            if (parent === draggedNode) {
                return false;
            }
        }
        return true;
    }

    private _getSection(y: number, overNode: IRowNode<IRecord>): ITaskDragSection {
        const third = overNode.rowHeight! / 3;
        const rowY = y - overNode.rowTop!;
        return rowY <= third ? 'top' : rowY <= 2 * third ? 'middle' : 'bottom';
    }

    private _getPosition(section: ITaskDragSection): ITaskMovePosition {
        return section === 'top' ? 'above' : section === 'bottom' ? 'below' : 'child';
    }

    private _refreshRowClasses(records: (IRecord | undefined)[]): void {
        this._services.get('rows').refreshRowClasses(records.filter((record): record is IRecord => !!record));
    }

    private get _provider(): ITaskDataProvider {
        return this._services.get('provider');
    }
}
