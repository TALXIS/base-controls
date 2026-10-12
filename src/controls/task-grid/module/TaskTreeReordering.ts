import { GridApi, IRowDragItem, IRowNode, IsRowValidDropPositionParams, IsRowValidDropPositionResult, RowDragEndEvent, RowDragEnterEvent } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { IGridAgGridInitialOptions, IGridAgGridOptions, IGridEditedCell, IGridRuntime, IGridStyles } from "@controls/grid";
import { ITaskGridServiceLocator } from "@controls/task-grid/services";
import { ITaskDataProvider } from "@controls/task-grid/providers/task";
import { ITaskTreeServiceMap } from "./GridTaskTree";
import { DROP_TARGET_ROW_CLASS, INDENT_STEP_WIDTH } from "./constants";
import { getTaskTreeReorderingStyles } from "./styles";
import { repathSubtree } from "./repathSubtree";

//AG Grid opens a hovered parent once this delay runs out
const NEVER_MS = 2 ** 31 - 1;
const DROP_INTO_ON_HOVER_MS = 400;
const EXPAND_ON_HOVER_MS = 700;

export interface ITaskTreeReorderingParameters {
    runtime: IGridRuntime<ITaskTreeServiceMap>;
}

interface IDragStart {
    record: IRecord;
    pointerX: number;
    level: number;
}

interface IGap {
    previous?: IRowNode<IRecord>;
    next?: IRowNode<IRecord>;
}

/** Tasks are moved by dragging their row: up and down among the rows, left and right between levels. */
export class TaskTreeReordering {
    private _runtime: IGridRuntime<ITaskTreeServiceMap>;
    private _isEditing = false;
    private _dragStart?: IDragStart;
    //the task the dragged one becomes a subtask of when dropped
    private _dropInto?: IRowNode<IRecord>;
    private _hoveredRow?: IRowNode<IRecord>;
    private _dropIntoTimer?: number;
    private _expandTimer?: number;

    constructor(parameters: ITaskTreeReorderingParameters) {
        this._runtime = parameters.runtime;
        this._runtime.registerAgGridInitialOptions(this._onAgGridInitialOptions);
        this._runtime.registerAgGridOptions(this._onAgGridOptions);
        this._runtime.services.get('gridTheme').registerStyles(this._onStyles);
        this._runtime.services.get('rows').registerRowClass(DROP_TARGET_ROW_CLASS, ({ record }) => this._dropInto?.data === record);
        this._runtime.services.find('editing')?.events.addEventListener('onEditedCellChanged', this._onEditedCellChanged);
        this._taskDataProvider.addEventListener('onBeforeNewDataLoaded', this._onBeforeNewDataLoaded);
        this._runtime.services.whenAvailable('gridApi', this._onGridApiAvailable);
        this._runtime.events.addEventListener('onDestroyed', this._onDestroyed);
    }

    private get _taskGrid(): ITaskGridServiceLocator {
        return this._runtime.services.get('taskGrid');
    }

    private get _taskDataProvider(): ITaskDataProvider {
        return this._taskGrid.get('taskDataProvider');
    }

    private get _gridApi(): GridApi<IRecord> {
        return this._runtime.services.get('gridApi');
    }

    private _onAgGridInitialOptions = (result: IGridAgGridInitialOptions): void => {
        result.options.rowDragText = this._getRowDragText;
    };

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.rowDragManaged = true;
        result.options.rowDragInsertDelay = NEVER_MS;
        result.options.rowDragEntireRow = true;
        result.options.animateRows = true;
        result.options.suppressRowDrag = !this._canDrag();
        result.options.isRowValidDropPosition = this._isRowValidDropPosition;
    };

    private _onStyles = (result: IGridStyles, theme: ITheme): void => {
        result.styles.push(getTaskTreeReorderingStyles(theme));
    };

    private _canDrag(): boolean {
        const sorting = this._taskDataProvider.getSorting();
        const isSortedByStackRank = sorting.length === 0 || sorting[0].name === this._taskGrid.get('nativeColumns').stackRank;
        return this._taskGrid.get('taskGrid').isRowDraggingEnabled() && !this._taskDataProvider.isFlatListEnabled() && isSortedByStackRank && !this._isEditing;
    }

    private _getRowDragText = (params: IRowDragItem): string => {
        return params.rowNode?.data?.getFormattedValue(this._taskGrid.get('nativeColumns').subject) ?? '';
    };

    private _isRowValidDropPosition = (params: IsRowValidDropPositionParams<IRecord>): IsRowValidDropPositionResult<IRecord> | boolean => {
        const dragged = new Set(params.rows);
        const over = params.overNode;
        const isOverTask = !!over && !this._isWithin(over, dragged) && params.pointerPos === 'inside';
        this._setHoveredRow(isOverTask ? over : undefined);
        //the rows hold still while the pointer rests on a task
        if (isOverTask) {
            return { rows: [], highlight: false };
        }
        const result = this._getGapDrop(this._getGap(params, dragged), params);
        this._setDropInto(result && 'id' in result ? result : undefined);
        if (!result) {
            return false;
        }
        if ('id' in result || this._isInPlace(result, params.source)) {
            return { rows: [], highlight: false };
        }
        //AG Grid moves a row only when the pointer leaves it, which a step sideways does not
        params.moved = true;
        return result;
    }

    private _getGap(params: IsRowValidDropPositionParams<IRecord>, dragged: Set<IRowNode<IRecord>>): IGap {
        const over = params.overNode;
        const source = params.source;
        if (!over) {
            return { previous: this._getDisplayedRow(this._gridApi.getDisplayedRowCount() - 1, -1, dragged) };
        }
        if (this._isWithin(over, dragged)) {
            return { previous: this._getDisplayedRow(source.rowIndex! - 1, -1, dragged), next: this._getDisplayedRow(source.rowIndex! + 1, 1, dragged) };
        }
        if (params.y - over.rowTop! < over.rowHeight! / 2) {
            return { previous: this._getDisplayedRow(over.rowIndex! - 1, -1, dragged), next: over };
        }
        return { previous: over, next: this._getDisplayedRow(over.rowIndex! + 1, 1, dragged) };
    }

    //the levels a gap takes are those that keep the rows around it where they are
    private _getGapDrop({ previous, next }: IGap, params: IsRowValidDropPositionParams<IRecord>): IsRowValidDropPositionResult<IRecord> | IRowNode<IRecord> | undefined {
        if (!previous) {
            return next && { target: next, position: 'above', newParent: params.rootNode };
        }
        const minLevel = next?.level ?? 0;
        const level = Math.min(previous.level + 1, Math.max(minLevel, this._getPointerLevel(params)));
        if (level > previous.level) {
            if (this._isCollapsedParent(previous)) {
                return previous;
            }
            return next?.parent === previous
                ? { target: next, position: 'above', newParent: previous }
                : { target: previous, position: 'inside', newParent: previous };
        }
        let anchor = previous;
        while (anchor.level > level) {
            anchor = anchor.parent!;
        }
        return { target: anchor, position: 'below', newParent: anchor.parent };
    }

    private _getPointerLevel(params: IsRowValidDropPositionParams<IRecord>): number {
        const start = this._dragStart;
        const pointerX = params.draggingEvent?.event.clientX;
        if (!start || pointerX === undefined) {
            return params.source.level;
        }
        return start.level + Math.round((pointerX - start.pointerX) / INDENT_STEP_WIDTH);
    }

    private _getDisplayedRow(index: number, step: 1 | -1, dragged: Set<IRowNode<IRecord>>): IRowNode<IRecord> | undefined {
        let row = this._gridApi.getDisplayedRowAtIndex(index);
        while (row && this._isWithin(row, dragged)) {
            index += step;
            row = this._gridApi.getDisplayedRowAtIndex(index);
        }
        return row;
    }

    private _isWithin(row: IRowNode<IRecord>, dragged: Set<IRowNode<IRecord>>): boolean {
        for (let node: IRowNode<IRecord> | null = row; node; node = node.parent) {
            if (dragged.has(node)) {
                return true;
            }
        }
        return false;
    }

    //a task becomes the drop target only once the pointer rests on it
    private _setHoveredRow(row: IRowNode<IRecord> | undefined): void {
        if (this._hoveredRow === row) {
            return;
        }
        this._hoveredRow = row;
        window.clearTimeout(this._dropIntoTimer);
        this._setDropInto(undefined);
        if (row) {
            this._dropIntoTimer = window.setTimeout(() => this._setDropInto(row), DROP_INTO_ON_HOVER_MS);
        }
    }

    private _setDropInto(row: IRowNode<IRecord> | undefined): void {
        const previous = this._dropInto;
        if (previous === row) {
            return;
        }
        this._dropInto = row;
        window.clearTimeout(this._expandTimer);
        if (row && this._isCollapsedParent(row)) {
            this._expandTimer = window.setTimeout(() => this._taskGrid.get('taskExpansion').setExpanded(row.id!, true), EXPAND_ON_HOVER_MS);
        }
        const records = [previous?.data, row?.data].filter((record): record is IRecord => !!record);
        this._runtime.services.get('rows').refreshRowClasses(records);
    }

    private _isCollapsedParent(row: IRowNode<IRecord>): boolean {
        return !!row.group && !row.expanded;
    }

    private _isInPlace(result: IsRowValidDropPositionResult<IRecord>, source: IRowNode<IRecord>): boolean {
        if (result.newParent !== source.parent) {
            return false;
        }
        const siblings = source.parent?.childrenAfterSort ?? [];
        const index = siblings.indexOf(source);
        switch (result.position) {
            case 'inside': {
                return index === 0;
            }
            case 'above': {
                return siblings[index + 1] === result.target;
            }
            default: {
                return siblings[index - 1] === result.target;
            }
        }
    }

    private _onEditedCellChanged = (_previous: IGridEditedCell | undefined, next: IGridEditedCell | undefined): void => {
        if (this._isEditing !== !!next) {
            this._isEditing = !!next;
            this._runtime.refreshAgGridOptions();
        }
    };

    private _onBeforeNewDataLoaded = (): void => {
        this._runtime.refreshAgGridOptions();
    };

    private _onGridApiAvailable = (gridApi: GridApi<IRecord>): void => {
        gridApi.addEventListener('rowDragEnter', this._onRowDragEnter);
        gridApi.addEventListener('rowDragEnd', this._onRowDragEnd);
        //fired on every mouse up of a drag, after rowDragEnd when the drop landed in the grid
        gridApi.addEventListener('dragStopped', this._restoreDraggedRow);
        gridApi.addEventListener('rowDragCancel', this._restoreDraggedRow);
    };

    //the provider outlives the grid
    private _onDestroyed = (): void => {
        this._taskDataProvider.removeEventListener('onBeforeNewDataLoaded', this._onBeforeNewDataLoaded);
    };

    private _onRowDragEnter = (event: RowDragEnterEvent<IRecord>): void => {
        if (!this._dragStart && event.node.data) {
            this._dragStart = { record: event.node.data, pointerX: event.event.clientX, level: event.node.level };
        }
    };

    //AG Grid fires this before it applies the drop
    private _onRowDragEnd = (event: RowDragEndEvent<IRecord>): void => {
        const dropInto = this._dropInto;
        this._dragStart = undefined;
        this._setHoveredRow(undefined);
        this._setDropInto(undefined);
        queueMicrotask(() => dropInto ? this._moveInto(event.node, dropInto) : this._moveDroppedRow(event.node));
    };

    //a drag that ends outside the grid has still moved its row
    private _restoreDraggedRow = (): void => {
        const record = this._dragStart?.record;
        this._dragStart = undefined;
        this._setHoveredRow(undefined);
        this._setDropInto(undefined);
        if (record) {
            this._restoreRows(record);
        }
    };

    private async _moveInto(node: IRowNode<IRecord>, parent: IRowNode<IRecord>): Promise<void> {
        const record = node.data;
        if (record && parent.data) {
            await this._moveTask(record, parent.data.getRecordId(), 'child');
        }
    }

    private async _moveDroppedRow(node: IRowNode<IRecord>): Promise<void> {
        const record = node.data;
        if (!record || node.rowPinned) {
            return;
        }
        const siblings = node.parent?.childrenAfterSort ?? [];
        const index = siblings.indexOf(node);
        const previous = siblings[index - 1]?.data;
        const next = siblings[index + 1]?.data;
        const parent = node.parent?.data;
        if (this._isUnmoved(record, parent, previous, next)) {
            return;
        }
        //AG Grid opens a parent it drops into without telling the expansion
        if (parent) {
            this._taskGrid.get('taskExpansion').setExpanded(parent.getRecordId(), true);
        }
        const [targetId, position] = previous ? [previous.getRecordId(), 'below' as const]
            : next ? [next.getRecordId(), 'above' as const]
            : [parent!.getRecordId(), 'child' as const];
        await this._moveTask(record, targetId, position);
    }

    private async _moveTask(record: IRecord, targetId: string, position: 'above' | 'below' | 'child'): Promise<void> {
        //null when the move was refused, cancelled or failed
        if (!await this._taskDataProvider.moveTask(record.getRecordId(), targetId, position)) {
            this._restoreRows(record);
        }
    }

    private _isUnmoved(record: IRecord, parent?: IRecord, previous?: IRecord, next?: IRecord): boolean {
        const structure = this._taskDataProvider.getRecordTree().structure;
        const neighbours = structure.getNeighbours(record.getRecordId());
        return structure.getParent(record.getRecordId()) === (parent ?? null)
            && neighbours.previous === previous
            && neighbours.next === next;
    }

    //an update has AG Grid read the rows' paths again, and the order comes back with the next rows
    private _restoreRows(record: IRecord): void {
        const gridApi = this._runtime.services.find('gridApi');
        if (gridApi) {
            repathSubtree(gridApi, this._taskDataProvider, record.getRecordId());
        }
        this._runtime.services.get('rowModel').refresh();
    }
}
