import { IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { ColDef, GridApi } from "ag-grid-community";
import { ThemeBuilder } from "@theme";
import { GridCellCommandsHook, GridCellLoadingHook, GridLockHook, GridSelectionStateHook, IGridAgGridInitialOptions, IGridAgGridOptions, RECORD_LOCK_COLUMN_KEY, RECORD_SAVE_COLUMN_KEY, SELECTION_COLUMN_KEY } from "@controls/grid";
import type { IGrid } from "@controls/grid";
import type { IStateStore } from "@utils";
import type { ITaskDataProvider, ITaskMoveParams } from "../provider";
import { PATH_COLUMN_NAME } from "../provider/record-tree";
import type { ITaskGridServiceMap } from "../services";
import type { ITaskRuntime } from "../runtime";
import { TASK_GRID_PRIORITY } from "../priorities";
import { TASK_GRID_LABELS } from "../labels";
import { TaskExpansion, ITaskTreeState, TASK_TREE_STATE_KEY } from "./TaskExpansion";
import { TreeCell } from "./tree-cell";
import { PercentCompleteCell } from "./percent-complete-cell";
import { ExpansionHeader } from "./expansion-header";
import { TASK_COMMANDS_COLUMN_KEY } from "./constants";
import { TaskCommandsCell } from "./task-commands-cell";
import { runQuietly } from "../runtime/runQuietly";

const LEADING_COLUMN_KEYS = new Set([SELECTION_COLUMN_KEY, RECORD_SAVE_COLUMN_KEY, RECORD_LOCK_COLUMN_KEY]);
const REVEAL_TASK_ATTEMPTS = 3;

export interface ITaskTreeParameters {
    grid: IGrid<ITaskGridServiceMap>;
    runtime: ITaskRuntime;
    /** The view's store in the dataset control. */
    state: IStateStore;
}

/** Draws the tasks as a tree on the grid: the rows, the subject column, dragging and expansion. */
export class TaskTree {
    private _grid: IGrid<ITaskGridServiceMap>;
    private _runtime: ITaskRuntime;
    private _state: IStateStore;
    private _provider: ITaskDataProvider;
    private _expansion: TaskExpansion;
    private _isFlatList: boolean;
    private _treeRows?: IRecord[];
    private _flatRows: IRecord[] = [];
    private _partiallySelectedIds?: Set<string>;
    private _unsaveWithView?: () => void;

    constructor(parameters: ITaskTreeParameters) {
        this._grid = parameters.grid;
        this._runtime = parameters.runtime;
        this._state = parameters.state;
        const services = this._grid.services;
        this._provider = services.get('provider');
        this._isFlatList = this._getState().isFlatList ?? parameters.runtime.getView()?.data?.isFlatList ?? false;
        this._expansion = new TaskExpansion({ provider: this._provider, state: this._state, onIsFlatList: () => this._isFlatList });
        parameters.runtime.services.register('taskTree', () => this);
        parameters.runtime.services.get('datasetControl').modules.whenAvailable('userQueries', userQueries => {
            this._unsaveWithView = userQueries.saveWithView('isFlatList', () => this._isFlatList);
        });
        services.register('taskExpansion', () => this._expansion);

        this._grid.registerAgGridInitialOptions(this._onAgGridInitialOptions, TASK_GRID_PRIORITY.tree);
        this._grid.registerAgGridOptions(this._onAgGridOptions, TASK_GRID_PRIORITY.tree);
        services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree);
        services.get('cells').registerCellTheme(this._onCellTheme, TASK_GRID_PRIORITY.tree);
        services.get('cells').registerCellLoading(this._onCellLoading, TASK_GRID_PRIORITY.tree);
        services.get('cells').registerCellCommands(this._onCellCommands, TASK_GRID_PRIORITY.tree);

        this._grid.modules.whenAvailable('rowSelection', selection => selection.registerSelectionState(this._onSelectionState, TASK_GRID_PRIORITY.tree));
        this._grid.modules.whenAvailable('editing', editing => editing.locks.registerLock(this._onLock, TASK_GRID_PRIORITY.tree));

        services.whenAvailable('gridApi', this._onGridApi);
        //ahead of row selection's listener, which redraws the checkboxes
        this._provider.addEventListener('onRecordsSelected', this._onRecordsSelected);
        this._provider.taskEvents.addEventListener('onTreeChanged', this._onTreeChanged);
        this._provider.taskEvents.addEventListener('onTaskMoved', this._onTaskMoved);
        this._provider.addEventListener('onRecordColumnValueChanged', this._onRecordColumnValueChanged);
        this._provider.taskEvents.addEventListener('onTasksCreated', this._onTasksCreated);
        this._provider.taskEvents.addEventListener('onTasksUpdated', this._onTasksUpdated);
        this._provider.addEventListener('onNewDataLoaded', this._onNewDataLoaded);
        this._provider.addEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
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
        this._state.set<ITaskTreeState>(TASK_TREE_STATE_KEY, { ...this._getState(), isFlatList });
        this._grid.refreshAgGridOptions();
        this._gridApi?.setColumnsVisible([TASK_COMMANDS_COLUMN_KEY], !isFlatList);
        this._gridApi?.refreshCells({ columns: [this._provider.getFieldMapping().subject], force: true });
        this._runtime.execute(() => this._syncPathColumn(isFlatList), { error: { rethrow: false } });
    }

    public revealTask(taskId: string): void {
        this._revealTask(taskId, REVEAL_TASK_ATTEMPTS);
    }

    private get _gridApi(): GridApi<IRecord> | undefined {
        return this._grid.services.find('gridApi');
    }

    private _onGridApi = (gridApi: GridApi<IRecord>): void => {
        this._expansion.attach(gridApi);
    };

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
    private _onCellTheme = (theme: ThemeBuilder, params: { record: IRecord; columnName: string }): void => {
        if (params.columnName !== this._provider.getFieldMapping().subject) {
            return;
        }
        theme.edit('taskGrid|subject', result => { result.fonts.medium.fontWeight = 600; });
        if (!this._provider.getRecordTree().view.isMatching(params.record.getRecordId())) {
            theme.edit('taskGrid|unmatchedParent', result => { result.fonts.medium.fontStyle = 'italic'; });
        }
    };

    //the same array until the rows change, so AG Grid is not handed new rows on every refresh
    private _getFlatRows(treeRows: IRecord[]): IRecord[] {
        if (treeRows !== this._treeRows) {
            const view = this._provider.getRecordTree().view;
            this._treeRows = treeRows;
            this._flatRows = treeRows.filter(record => view.isMatching(record.getRecordId()));
        }
        return this._flatRows;
    }

    //runs only on a switch
    private async _syncPathColumn(isFlatList: boolean): Promise<void> {
        const provider = this._provider;
        //not the columns map, which keeps a column once defined
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

    private _onTaskMoved = (params: ITaskMoveParams): void => {
        if (params.position === 'child') {
            this._expansion.setExpanded(params.targetRecord.getRecordId(), true);
        }
        this._provider.clearSelectedRecordIds();
    };

    private _onTasksCreated = (_records: IRecord[], parentId?: string): void => {
        if (parentId) {
            this._expansion.setExpanded(parentId, true);
        }
    };

    //AG Grid draws a new row in a later frame
    private _revealTask(recordId: string, attemptsLeft: number): void {
        const gridApi = this._gridApi;
        if (!gridApi || gridApi.isDestroyed()) {
            return;
        }
        const node = gridApi.getRowNode(recordId);
        if (node?.rowIndex != null) {
            gridApi.ensureNodeVisible(node);
        }
        else if (attemptsLeft > 1) {
            requestAnimationFrame(() => this._revealTask(recordId, attemptsLeft - 1));
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
        this._unsaveWithView?.();
        if (this._runtime.services.find('taskTree') === this) {
            this._runtime.services.unregister('taskTree');
        }
        this._provider.removeEventListener('onRecordsSelected', this._onRecordsSelected);
        this._provider.taskEvents.removeEventListener('onTreeChanged', this._onTreeChanged);
        this._provider.taskEvents.removeEventListener('onTaskMoved', this._onTaskMoved);
        this._provider.removeEventListener('onRecordColumnValueChanged', this._onRecordColumnValueChanged);
        this._provider.taskEvents.removeEventListener('onTasksCreated', this._onTasksCreated);
        this._provider.taskEvents.removeEventListener('onTasksUpdated', this._onTasksUpdated);
        this._provider.removeEventListener('onNewDataLoaded', this._onNewDataLoaded);
        this._provider.removeEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
    }
}
