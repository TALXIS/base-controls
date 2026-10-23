import { IRecord } from "@talxis/client-libraries";
import { GridApi, IRowDragItem, RowDragModule, IRowNode, IsRowValidDropPositionParams, IsRowValidDropPositionResult, RowDragEndEvent, RowDragEnterEvent } from "ag-grid-community";
import { ITheme } from "@fluentui/react";
import type { IGrid, IGridAgGridInitialOptions, IGridAgGridOptions, IGridEditedCell, IGridStyles } from "@controls/grid";
import type { ITaskDataProvider, ITaskMoveParams, ITaskMovePosition } from "../../provider";
import type { ITaskRuntime } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { LEVEL_INDENT, TASK_ROW_CLASS_NAMES } from "../../tree/constants";
import type { ITaskExpansion } from "../../tree/TaskExpansion";

//AG Grid would open a hovered parent on its own once this runs out
const NEVER_MS = 2 ** 31 - 1;
const DROP_INTO_ON_HOVER_MS = 400;
const EXPAND_ON_HOVER_MS = 700;
//AG Grid's default slide trails behind the pointer
const ROW_SLIDE_MS = 120;

interface IDragStart {
    record: IRecord;
    pointerX: number;
    level: number;
    pointerLevel: number;
}

interface IGap {
    previous?: IRowNode<IRecord>;
    next?: IRowNode<IRecord>;
}

export interface ITaskDraggingParameters {
    /** Called after a dragged task is moved. */
    onTaskMoved?(params: ITaskMoveParams): void;
}

/** Moves a task by dragging its row: between rows, sideways between levels, or onto another task. */
export class TaskDragging {
    private _grid!: IGrid<ITaskGridServiceMap>;
    private _taskRuntime: ITaskRuntime;
    private _parameters: ITaskDraggingParameters;
    private _taskProvider?: ITaskDataProvider;
    private _isEditing = false;
    private _dragStart?: IDragStart;
    private _dropInto?: IRowNode<IRecord>;
    private _hoveredRow?: IRowNode<IRecord>;
    private _dropIntoTimer?: number;
    private _expandTimer?: number;
    private _isAnimating = false;
    private _animationTimer?: number;

    constructor(taskRuntime: ITaskRuntime, parameters: ITaskDraggingParameters) {
        this._taskRuntime = taskRuntime;
        this._parameters = parameters;
        taskRuntime.services.whenAvailable('provider', this._onProviderAvailable);
        taskRuntime.registerGridModule({ agGridModules: [RowDragModule], onRegister: grid => this._onGridRegistered(grid) });
    }

    public destroy(): void {
        this._taskProvider?.taskEvents.removeEventListener('onTaskMoved', this._onTaskMoved);
    }

    private _onGridRegistered(grid: IGrid<ITaskGridServiceMap>): void {
        this._grid = grid;
        const services = grid.services;
        this._grid.registerAgGridInitialOptions(this._onAgGridInitialOptions, TASK_GRID_PRIORITY.tree);
        this._grid.registerAgGridOptions(this._onAgGridOptions, TASK_GRID_PRIORITY.tree);
        services.get('gridTheme').registerStyles(this._onStyles, TASK_GRID_PRIORITY.tree);
        services.get('rows').registerRowClass(TASK_ROW_CLASS_NAMES.dropTarget, ({ record }) => this._dropInto?.data === record);
        services.whenAvailable('editing', editing => editing.events.addEventListener('onEditedCellChanged', this._onEditedCellChanged));
        services.whenAvailable('gridApi', this._onGridApiAvailable);
        this._provider.addEventListener('onBeforeNewDataLoaded', this._onBeforeNewDataLoaded);
        this._grid.events.addEventListener('onDestroyed', this._onDestroyed);
    }

    private get _provider(): ITaskDataProvider {
        return this._grid.services.get('provider');
    }

    private get _expansion(): ITaskExpansion {
        return this._grid.services.get('taskExpansion');
    }

    private get _gridApi(): GridApi<IRecord> {
        return this._grid.services.get('gridApi');
    }

    private _onAgGridInitialOptions = (result: IGridAgGridInitialOptions): void => {
        result.options.rowDragText = this._getRowDragText;
    };

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.rowDragManaged = true;
        result.options.rowDragInsertDelay = NEVER_MS;
        result.options.rowDragEntireRow = true;
        //only while the other rows make way for a dragged one
        result.options.animateRows = this._isAnimating;
        result.options.suppressRowDrag = !this._canDrag();
        result.options.isRowValidDropPosition = this._isRowValidDropPosition;
    };

    private _onStyles = (result: IGridStyles, theme: ITheme): void => {
        result.styles.push({
            selectors: {
                [`.${TASK_ROW_CLASS_NAMES.dropTarget}`]: { outline: `1px solid ${theme.palette.themePrimary}`, outlineOffset: '-1px' },
                //above the pinned cells, which AG Grid stacks over the row
                [`.${TASK_ROW_CLASS_NAMES.dropTarget}::before`]: { content: "''", position: 'absolute', inset: 0, zIndex: 3, backgroundColor: theme.palette.themePrimary, opacity: 0.12, pointerEvents: 'none' },
                '.ag-row': { transitionDuration: `${ROW_SLIDE_MS}ms` },
            },
        });
    };

    private _isEditingEnabled(): boolean {
        return this._taskRuntime.isEditingEnabled();
    }

    //a refused task snaps back
    private _canMoveTask(taskId: string): boolean {
        return this._isEditingEnabled() && this._provider.isRecordActive(taskId);
    }

    private _canDrag(): boolean {
        const sorting = this._provider.getSorting();
        const isSortedByStackRank = sorting.length === 0 || sorting[0].name === this._provider.getFieldMapping().stackRank;
        return !this._taskRuntime.isFlatList() && this._isEditingEnabled() && isSortedByStackRank && !this._isEditing;
    }

    private _getRowDragText = (params: IRowDragItem): string => {
        return params.rowNode?.data?.getFormattedValue(this._provider.getFieldMapping().subject) ?? '';
    };

    private _isRowValidDropPosition = (params: IsRowValidDropPositionParams<IRecord>): IsRowValidDropPositionResult<IRecord> | boolean => {
        const dragged = new Set(params.rows);
        const over = params.overNode;
        const isOverTask = !!over && !this._isWithin(over, dragged) && params.pointerPos === 'inside';
        this._setHoveredRow(isOverTask ? over : undefined);
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
        //AG Grid moves a row only once the pointer leaves it, which a step sideways never does
        params.moved = true;
        return result;
    };

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

    //a gap allows only the levels that keep the rows around it where they are
    private _getGapDrop({ previous, next }: IGap, params: IsRowValidDropPositionParams<IRecord>): IsRowValidDropPositionResult<IRecord> | IRowNode<IRecord> | undefined {
        if (!previous) {
            return next && { target: next, position: 'above', newParent: params.rootNode };
        }
        const level = Math.min(previous.level + 1, Math.max(next?.level ?? 0, this._getPointerLevel(params)));
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
        //the level changes only a full indent away from the current one, so drift does not move it
        const steps = start.level + (pointerX - start.pointerX) / LEVEL_INDENT;
        if (Math.abs(steps - start.pointerLevel) >= 1) {
            start.pointerLevel = steps > start.pointerLevel ? Math.floor(steps) : Math.ceil(steps);
        }
        return start.pointerLevel;
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

    private _setHoveredRow(row: IRowNode<IRecord> | undefined): void {
        if (this._hoveredRow === row) {
            return;
        }
        this._hoveredRow = row;
        window.clearTimeout(this._dropIntoTimer);
        this._setDropInto(undefined);
        if (row && this._provider.isRecordActive(row.id!)) {
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
            this._expandTimer = window.setTimeout(() => this._expansion.setExpanded(row.id!, true), EXPAND_ON_HOVER_MS);
        }
        const records = [previous?.data, row?.data].filter((record): record is IRecord => !!record);
        this._grid.services.get('rows').refreshRowClasses(records);
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
            this._grid.refreshAgGridOptions();
        }
    };

    //a sort by another column turns dragging off
    private _onBeforeNewDataLoaded = (): void => this._grid.refreshAgGridOptions();

    private _onGridApiAvailable = (gridApi: GridApi<IRecord>): void => {
        gridApi.addEventListener('rowDragEnter', this._onRowDragEnter);
        gridApi.addEventListener('rowDragEnd', this._onRowDragEnd);
        gridApi.addEventListener('dragStopped', this._restoreDraggedRow);
        gridApi.addEventListener('rowDragCancel', this._restoreDraggedRow);
    };

    private _onProviderAvailable = (provider: ITaskDataProvider): void => {
        this._taskProvider = provider;
        provider.taskEvents.addEventListener('onTaskMoved', this._onTaskMoved);
    };

    private _onTaskMoved = (params: ITaskMoveParams): void => this._parameters.onTaskMoved?.(params);

    private _onDestroyed = (): void => {
        window.clearTimeout(this._dropIntoTimer);
        window.clearTimeout(this._expandTimer);
        window.clearTimeout(this._animationTimer);
        this._provider.removeEventListener('onBeforeNewDataLoaded', this._onBeforeNewDataLoaded);
    };

    private _onRowDragEnter = (event: RowDragEnterEvent<IRecord>): void => {
        const node = event.node;
        if (this._dragStart || !node.data) {
            return;
        }
        this._dragStart = { record: node.data, pointerX: event.event.clientX, level: node.level, pointerLevel: node.level };
        this._setAnimating(true);
        if (node.expanded) {
            this._expansion.setExpanded(node.id!, false);
        }
    };

    //fired before AG Grid applies the drop
    private _onRowDragEnd = (event: RowDragEndEvent<IRecord>): void => {
        const dropInto = this._dropInto;
        this._endDrag();
        queueMicrotask(async () => {
            await (dropInto ? this._moveInto(event.node, dropInto) : this._moveDroppedRow(event.node));
            this._stopAnimating();
        });
    };

    //a drag that ends outside the grid has still moved its row
    private _restoreDraggedRow = (): void => {
        const start = this._endDrag();
        if (start) {
            this._restoreRows(start.record);
            this._stopAnimating();
        }
    };

    private _endDrag(): IDragStart | undefined {
        const start = this._dragStart;
        this._dragStart = undefined;
        this._setHoveredRow(undefined);
        this._setDropInto(undefined);
        return start;
    }

    private _setAnimating(isAnimating: boolean): void {
        window.clearTimeout(this._animationTimer);
        if (this._isAnimating !== isAnimating) {
            this._isAnimating = isAnimating;
            this._grid.refreshAgGridOptions();
        }
    }

    //after the dropped rows have slid into place
    private _stopAnimating(): void {
        window.clearTimeout(this._animationTimer);
        this._animationTimer = window.setTimeout(() => this._setAnimating(false), ROW_SLIDE_MS);
    }

    private async _moveInto(node: IRowNode<IRecord>, parent: IRowNode<IRecord>): Promise<void> {
        if (node.data && parent.data) {
            await this._moveTask(node.data, parent.data.getRecordId(), 'child');
        }
    }

    private async _moveDroppedRow(node: IRowNode<IRecord>): Promise<void> {
        const record = node.data;
        if (!record) {
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
            this._expansion.setExpanded(parent.getRecordId(), true);
        }
        const target: [string, ITaskMovePosition] | undefined = previous ? [previous.getRecordId(), 'below']
            : next ? [next.getRecordId(), 'above']
            : parent ? [parent.getRecordId(), 'child']
            : undefined;
        if (!target) {
            this._restoreRows(record);
            return;
        }
        await this._moveTask(record, ...target);
    }

    //a refused, cancelled or failed move snaps back
    private async _moveTask(record: IRecord, targetId: string, position: ITaskMovePosition): Promise<void> {
        try {
            if (!this._canMoveTask(record.getRecordId()) || !await this._provider.moveTask(record.getRecordId(), targetId, position)) {
                this._restoreRows(record);
            }
        }
        catch {
            this._restoreRows(record);
        }
    }

    //AG Grid's siblings leave out hidden and out-of-scope tasks
    private _isUnmoved(record: IRecord, parent?: IRecord, previous?: IRecord, next?: IRecord): boolean {
        const view = this._provider.getRecordTree().view;
        const recordId = record.getRecordId();
        const path = view.getPath(recordId);
        const parentId = path.length > 1 ? path[path.length - 2] : null;
        const siblings = view.getChildren(parentId);
        const index = siblings.findIndex(sibling => sibling.getRecordId() === recordId);
        return parentId === (parent?.getRecordId() ?? null)
            && siblings[index - 1] === previous
            && siblings[index + 1] === next;
    }

    //AG Grid reads a row's path again only when told the row was updated
    private _restoreRows(record: IRecord): void {
        const gridApi = this._grid.services.find('gridApi');
        const subtree = [record, ...this._provider.getRecordTree().structure.getDescendants(record.getRecordId())];
        gridApi?.applyTransaction({ update: subtree.filter(task => gridApi.getRowNode(task.getRecordId())) });
        //a copy, as AG Grid keeps its dragged order when handed the provider's unchanged array
        gridApi?.setGridOption('rowData', [...this._provider.getRecords()]);
    }
}
