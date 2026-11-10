import { IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { ColDef, GridApi, IRowNode } from "ag-grid-community";
import { ThemeBuilder } from "@theme";
import { GridCellCommandsHook, GridCellLoadingHook, GridLockHook, GridSelectionStateHook, GridOpenRecordHook, IGridAgGridInitialOptions, IGridAgGridOptions, RECORD_LOCK_COLUMN_KEY, RECORD_SAVE_COLUMN_KEY, SELECTION_COLUMN_KEY } from "@controls/grid";
import type { IGrid } from "@controls/grid";
import type { IStateStore } from "@core";
import type { ITaskDataProvider, ITaskMoveParameters } from "../provider";
import { PATH_COLUMN_NAME } from "../provider/record-tree";
import type { ITaskGridServiceMap } from "../../services";
import type { ITaskGridTree, ITaskRuntime } from "..";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { TASK_GRID_LABELS } from "../../labels";
import { TaskExpansion } from "./TaskExpansion";
import { ExpansionHeader, PercentCompleteCell, TaskCommandsCell, TreeCell } from "../../adapters";
import { TASK_COMMANDS_COLUMN_KEY } from "../../constants";
import { runQuietly } from "../runQuietly";

const LEADING_COLUMN_KEYS = new Set([SELECTION_COLUMN_KEY, RECORD_SAVE_COLUMN_KEY, RECORD_LOCK_COLUMN_KEY]);
const REVEAL_TASK_ATTEMPTS = 3;
const TASK_TREE_STATE_KEY = 'taskTree';

interface ITaskTreeState {
    expandedIds?: string[];
    isFlatList?: boolean;
}

export interface ITaskTreeParameters {
    grid: IGrid<ITaskGridServiceMap>;
    runtime: ITaskRuntime;
    /** The view's store in the dataset control. */
    state: IStateStore;
}

/** Draws the tasks as a tree on the grid. */
export class TaskTree implements ITaskGridTree {
    private _grid: IGrid<ITaskGridServiceMap>;
    private _runtime: ITaskRuntime;
    private _state: IStateStore;
    private _provider: ITaskDataProvider;
    private _expansion: TaskExpansion;
    private _removeFromRuntime: () => void;
    private _isFlatList: boolean;
    private _treeRows?: IRecord[];
    private _flatRows: IRecord[] = [];
    private _partiallySelectedIds?: Set<string>;
    private _unsubscribes: (() => void)[];

    constructor(parameters: ITaskTreeParameters) {
        this._grid = parameters.grid;
        this._runtime = parameters.runtime;
        this._state = parameters.state;
        const services = this._grid.services;
        this._provider = services.get('provider');
        this._isFlatList = this._getState().isFlatList ?? parameters.runtime.getView()?.data?.isFlatList ?? false;
        this._expansion = new TaskExpansion({
            provider: this._provider,
            expandedIds: this._getState().expandedIds ?? [],
            isFlatList: () => this._isFlatList,
            onExpandedIdsChanged: expandedIds => this._setState({ expandedIds }),
        });
        this._removeFromRuntime = parameters.runtime.services.provide('taskTree', this);
        services.provide('taskExpansion', this._expansion);

        this._grid.hooks.agGridInitialOptions.add(this._onAgGridInitialOptions, TASK_GRID_PRIORITY.tree);
        this._grid.hooks.agGridOptions.add(this._onAgGridOptions, TASK_GRID_PRIORITY.tree);
        this._grid.hooks.openRecord.add(this._onOpenRecord, TASK_GRID_PRIORITY.tree);
        services.get('columns').hooks.columnDefinitions.add(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree);
        services.get('cells').hooks.theme.add(this._onCellTheme, TASK_GRID_PRIORITY.tree);
        services.get('cells').hooks.loading.add(this._onCellLoading, TASK_GRID_PRIORITY.tree);
        services.get('cells').hooks.commands.add(this._onCellCommands, TASK_GRID_PRIORITY.tree);

        this._grid.modules.observe('rowSelection', selection => { selection.hooks.selectionState.add(this._onSelectionState, TASK_GRID_PRIORITY.tree); });
        this._grid.modules.observe('editing', editing => { editing.locks.hooks.lock.add(this._onLock, TASK_GRID_PRIORITY.tree); });
        services.observe('gridApi', this._onGridApi);
        this._unsubscribes = [
            parameters.runtime.services.get('datasetControl').modules.observe('userQueries', userQueries => userQueries.saveWithView('isFlatList', () => this._isFlatList)),
            //before row selection redraws the checkboxes
            this._provider.addEventListener('onRecordsSelected', this._onRecordsSelected),
            this._provider.taskEvents.addEventListener('onTreeChanged', this._onTreeChanged),
            this._provider.taskEvents.addEventListener('onTaskMoved', this._onTaskMoved),
            this._provider.addEventListener('onRecordColumnValueChanged', this._onRecordColumnValueChanged),
            this._provider.taskEvents.addEventListener('onTasksCreated', this._onTasksCreated),
            this._provider.taskEvents.addEventListener('onTasksUpdated', this._onTasksUpdated),
            this._provider.addEventListener('onNewDataLoaded', this._onNewDataLoaded),
            this._provider.addEventListener('onAfterRecordSaved', this._onAfterRecordSaved),
        ];
    }

    /** Whether the matching tasks are listed on their own, without the tree. */
    public isFlatList(): boolean {
        return this._isFlatList;
    }

    public setFlatList(isFlatList: boolean): void {
        if (this._isFlatList === isFlatList) {
            return;
        }
        this._isFlatList = isFlatList;
        this._setState({ isFlatList });
        this._grid.refreshAgGridOptions();
        this._gridApi?.setColumnsVisible([TASK_COMMANDS_COLUMN_KEY], !isFlatList);
        this._gridApi?.refreshCells({ columns: [this._provider.getFieldMapping().subject], force: true });
        this._runtime.execute(() => this._syncPathColumn(isFlatList), { error: { rethrow: false } });
    }

    public revealTask(taskId: string): void {
        this._revealTask(taskId, REVEAL_TASK_ATTEMPTS);
    }

    public editTaskSubject(taskId: string): void {
        if (!this._grid.modules.find('editing')) {
            return;
        }
        this._revealTask(taskId, REVEAL_TASK_ATTEMPTS, node => {
            this._gridApi?.startEditingCell({ rowIndex: node.rowIndex!, colKey: this._provider.getFieldMapping().subject });
            this._selectEditorText(REVEAL_TASK_ATTEMPTS);
        });
    }

    private get _gridApi(): GridApi<IRecord> | undefined {
        return this._grid.services.find('gridApi');
    }

    private _onGridApi = (gridApi: GridApi<IRecord>): (() => void) => this._expansion.attach(gridApi);

    private _onAgGridInitialOptions = (result: IGridAgGridInitialOptions): void => {
        result.options.getDataPath = record => this._provider.getRecordTree().view.getPath(record.getRecordId());
    };

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.treeData = !this._isFlatList;
        if (this._isFlatList) {
            result.options.rowData = this._getFlatRows(result.options.rowData ?? []);
        }
        result.options.groupDisplayType = 'custom';
        result.options.isGroupOpenByDefault = params => !!params.rowNode.id && this._expansion.isExpanded(params.rowNode.id);
    };

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const { subject, percentComplete } = this._provider.getFieldMapping();
        const subjectColDef = columnDefs.find(colDef => colDef.colId === subject);
        if (subjectColDef) {
            subjectColDef.cellRenderer = TreeCell;
            subjectColDef.pinned = 'left';
        }
        const percentCompleteColDef = percentComplete ? columnDefs.find(colDef => colDef.colId === percentComplete) : undefined;
        if (percentCompleteColDef) {
            percentCompleteColDef.cellRenderer = PercentCompleteCell;
        }
        columnDefs.push({
            colId: TASK_COMMANDS_COLUMN_KEY,
            headerName: '',
            hide: this._isFlatList,
            width: 50,
            pinned: 'left',
            lockPinned: true,
            lockPosition: true,
            resizable: false,
            suppressMovable: true,
            suppressSizeToFit: true,
            cellRenderer: TaskCommandsCell,
            headerComponent: ExpansionHeader,
        });
        const getOrder = (colDef: ColDef<IRecord>): number => {
            if (LEADING_COLUMN_KEYS.has(colDef.colId!)) {
                return 0;
            }
            return colDef.colId === TASK_COMMANDS_COLUMN_KEY ? 1 : colDef.colId === subject ? 2 : 3;
        };
        columnDefs.sort((left, right) => getOrder(left) - getOrder(right));
    };

    private _onCellCommands: GridCellCommandsHook = (result, { record, columnName }) => {
        const recordId = record.getRecordId();
        //a pinned row is not one of the tasks
        const isTask = !!this._provider.getRecordsMap()[recordId];
        if (columnName !== TASK_COMMANDS_COLUMN_KEY || !this._runtime.isCreationEnabled() || !isTask || !this._provider.isRecordActive(recordId) || this._provider.isTaskPending(recordId)) {
            return;
        }
        const label = this._runtime.getLabels(TASK_GRID_LABELS).get('taskGrid.addChild');
        result.items.push({ key: 'addChild', iconProps: { iconName: 'Add' }, iconOnly: true, title: label, ariaLabel: label, onClick: () => { runQuietly(() => this._runtime.tasks.create(recordId)); } });
    };

    private _onOpenRecord: GridOpenRecordHook = request => {
        if (request.isHandled) {
            return;
        }
        request.isHandled = true;
        runQuietly(() => this._runtime.tasks.openRecord(request.reference, request.columnName));
    };

    private _onLock: GridLockHook = (result, context) => {
        if (context.record && !context.columnName && !this._runtime.isEditingEnabled()) {
            result.isLocked = true;
        }
    };

    private _onCellLoading: GridCellLoadingHook = (result, { record }) => {
        if (this._provider.isTaskPending(record.getRecordId())) {
            result.isLoading = true;
        }
    };

    //an unmatched parent is shown only because something under it matched
    private _onCellTheme = (builder: ThemeBuilder, parameters: { record: IRecord; columnName: string }): void => {
        if (parameters.columnName !== this._provider.getFieldMapping().subject) {
            return;
        }
        builder.edit('taskGrid|subject', result => { result.fonts.medium.fontWeight = 600; });
        if (!this._provider.getRecordTree().view.isMatching(parameters.record.getRecordId())) {
            builder.edit('taskGrid|unmatchedParent', result => { result.fonts.medium.fontStyle = 'italic'; });
        }
    };

    //AG Grid takes a new array as new rows
    private _getFlatRows(treeRows: IRecord[]): IRecord[] {
        if (treeRows !== this._treeRows) {
            const view = this._provider.getRecordTree().view;
            this._treeRows = treeRows;
            const order = this._getTreeOrder();
            this._flatRows = treeRows
                .filter(record => view.isMatching(record.getRecordId()))
                .sort((first, second) => (order.get(first.getRecordId()) ?? Infinity) - (order.get(second.getRecordId()) ?? Infinity));
        }
        return this._flatRows;
    }

    //depth first, so each task stays under its parent in the flat list
    private _getTreeOrder(): Map<string, number> {
        const { structure } = this._provider.getRecordTree();
        const order = new Map<string, number>();
        const visit = (parentId?: string) => structure.getChildren(parentId).forEach(child => {
            order.set(child.getRecordId(), order.size);
            visit(child.getRecordId());
        });
        visit();
        return order;
    }

    //runs only on a switch
    private async _syncPathColumn(isFlatList: boolean): Promise<void> {
        const provider = this._provider;
        //the columns map keeps a column once defined
        const pathColumn = provider.getColumns().find(column => column.name === PATH_COLUMN_NAME);
        const columns = provider.getColumns().filter(column => column.name !== PATH_COLUMN_NAME);
        if (isFlatList && (!pathColumn || pathColumn.isHidden)) {
            const definition = (await provider.getAvailableColumns()).find(column => column.name === PATH_COLUMN_NAME);
            if (!definition) {
                return;
            }
            const ordered = [...columns].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
            const subjectIndex = ordered.findIndex(column => column.name === provider.getFieldMapping().subject);
            ordered.splice(subjectIndex + 1, 0, { ...definition, isHidden: false });
            provider.setColumns(ordered.map((column, order) => ({ ...column, order })));
        }
        else if (!isFlatList && pathColumn) {
            provider.setColumns(columns);
        }
        else {
            return;
        }
        await provider.refresh();
    }

    private _getState(): ITaskTreeState {
        return this._state.get<ITaskTreeState>(TASK_TREE_STATE_KEY) ?? {};
    }

    private _setState(state: ITaskTreeState): void {
        this._state.set<ITaskTreeState>(TASK_TREE_STATE_KEY, { ...this._getState(), ...state });
    }

    private _onNewDataLoaded = (): void => {
        this._partiallySelectedIds = undefined;
        this._expansion.prune();
    };

    private _onRecordsSelected = (): void => {
        this._partiallySelectedIds = undefined;
    };

    private _onSelectionState: GridSelectionStateHook = (result, context) => {
        if (!this._isFlatList && result.state === 'unchecked' && this._getPartiallySelectedIds().has(context.record.getRecordId())) {
            result.state = 'indeterminate';
        }
    };

    //the ancestors of the shown tasks that are selected
    private _getPartiallySelectedIds(): Set<string> {
        if (!this._partiallySelectedIds) {
            const { view, structure } = this._provider.getRecordTree();
            const shownIds = new Set(view.getOrderedIds());
            const partiallySelectedIds = new Set<string>();
            for (const taskId of this._provider.getSelectedRecordIds()) {
                if (shownIds.has(taskId)) {
                    structure.getAncestorIds(taskId).filter(ancestorId => ancestorId !== taskId).forEach(ancestorId => partiallySelectedIds.add(ancestorId));
                }
            }
            this._partiallySelectedIds = partiallySelectedIds;
        }
        return this._partiallySelectedIds;
    }

    private _onTreeChanged = (): void => {
        this._partiallySelectedIds = undefined;
        this._expansion.prune();
        this._grid.modules.get('rowModel').refresh();
        this._gridApi?.refreshCells({ columns: [this._provider.getFieldMapping().subject], force: true });
    };

    //AG Grid reads a moved subtree's paths again only for rows it is told were updated
    private _onRecordColumnValueChanged = (record: IRecord, columnName: string): void => {
        const { parentId, stackRank } = this._provider.getFieldMapping();
        if (columnName !== parentId && columnName !== stackRank) {
            return;
        }
        const subtree = [record, ...this._provider.getRecordTree().structure.getDescendants(record.getRecordId())];
        const gridApi = this._gridApi;
        gridApi?.applyTransaction({ update: subtree.filter(task => gridApi.getRowNode(task.getRecordId())) });
    };

    private _onTaskMoved = (parameters: ITaskMoveParameters): void => {
        if (parameters.position === 'child') {
            this._expansion.setExpanded(parameters.targetRecord.getRecordId(), true);
        }
        this._provider.clearSelectedRecordIds();
    };

    private _onTasksCreated = (_records: IRecord[], parentId?: string): void => {
        if (parentId) {
            this._expansion.setExpanded(parentId, true);
        }
    };

    //typing replaces the placeholder name; the editor mounts in a later frame
    private _selectEditorText(attemptsLeft: number): void {
        const input = this._grid.services.find('viewport')?.getScrollElement()?.closest('.ag-root-wrapper')?.querySelector<HTMLInputElement>('.ag-cell-inline-editing input');
        if (input) {
            input.select();
            //a subject wider than the grid would otherwise open scrolled to its end
            this._gridApi?.ensureColumnVisible(this._provider.getFieldMapping().subject, 'start');
        }
        else if (attemptsLeft > 1) {
            requestAnimationFrame(() => this._selectEditorText(attemptsLeft - 1));
        }
    }

    //AG Grid draws a new row in a later frame
    private _revealTask(recordId: string, attemptsLeft: number, onRevealed?: (node: IRowNode<IRecord>) => void): void {
        const gridApi = this._gridApi;
        if (!gridApi || gridApi.isDestroyed()) {
            return;
        }
        const node = gridApi.getRowNode(recordId);
        if (node?.rowIndex != null) {
            gridApi.ensureNodeVisible(node);
            onRevealed?.(node);
        }
        else if (attemptsLeft > 1) {
            requestAnimationFrame(() => this._revealTask(recordId, attemptsLeft - 1, onRevealed));
        }
    }

    private _onTasksUpdated = (records: IRecord[]): void => {
        const recordIds = new Set(records.map(record => record.getRecordId()));
        const rowNodes = this._gridApi?.getRenderedNodes().filter(node => node.id && recordIds.has(node.id));
        this._gridApi?.refreshCells({ rowNodes, force: true });
        this._grid.services.get('rows').refreshRowClasses(records);
    };

    //whether a task is active can change with a save
    private _onAfterRecordSaved = (result: IRecordSaveOperationResult): void => {
        const record = this._provider.getRecordsMap()[result.recordId];
        if (result.success && record) {
            this._grid.services.get('rows').refreshRowClasses([record]);
        }
    };

    /** Called as the grid tears down. */
    public destroy(): void {
        this._unsubscribes.forEach(unsubscribe => unsubscribe());
        //the runtime outlives the grid, and the next grid's tree may already be there
        this._removeFromRuntime();
    }
}
