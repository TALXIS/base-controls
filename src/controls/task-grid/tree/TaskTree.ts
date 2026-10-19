import { IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { ColDef, GridApi } from "ag-grid-community";
import { ThemeBuilder } from "@theme";
import { IGridAgGridInitialOptions, IGridAgGridOptions, RECORD_LOCK_COLUMN_KEY, RECORD_SAVE_COLUMN_KEY, SELECTION_COLUMN_KEY } from "@controls/grid";
import type { IGrid } from "@controls/grid";
import type { ITaskDataProvider, ITaskMoveParams } from "../provider";
import type { ITaskGridServiceMap } from "../services";
import type { ITaskDatasetControlRuntime, ITaskGridSetting } from "../runtime";
import { TASK_GRID_MODULE_PRIORITY } from "../modules/priorities";
import { TaskExpansion, ITaskTreeState, TASK_TREE_STATE_KEY } from "./TaskExpansion";
import { TreeCell } from "./tree-cell";
import { AddTaskCell } from "./add-task-cell";
import { ExpansionHeader } from "./expansion-header";
import { ADD_TASK_COLUMN_KEY } from "./constants";

const LEADING_COLUMN_KEYS = new Set([SELECTION_COLUMN_KEY, RECORD_SAVE_COLUMN_KEY, RECORD_LOCK_COLUMN_KEY]);
const NEW_TASK_FOCUS_ATTEMPTS = 3;

export interface ITaskTreeParameters {
    grid: IGrid<ITaskGridServiceMap>;
    runtime: ITaskDatasetControlRuntime;
}

/** Draws the tasks as a tree on the grid: the rows, the subject column, dragging and expansion. */
export class TaskTree {
    private _grid: IGrid<ITaskGridServiceMap>;
    private _runtime: ITaskDatasetControlRuntime;
    private _provider: ITaskDataProvider;
    private _expansion: TaskExpansion;
    private _isFlatList: boolean;
    private _treeRows?: IRecord[];
    private _flatRows: IRecord[] = [];

    constructor(parameters: ITaskTreeParameters) {
        this._grid = parameters.grid;
        this._runtime = parameters.runtime;
        const services = this._grid.services;
        this._provider = services.get('provider');
        this._isFlatList = this._getState().isFlatList ?? parameters.runtime.getView()?.data?.isFlatList ?? false;
        this._expansion = new TaskExpansion({ provider: this._provider, state: services.get('state'), onIsFlatList: () => this._isFlatList });
        parameters.runtime.services.register('taskTree', () => this);
        services.register('taskTree', () => this);
        services.register('taskExpansion', () => this._expansion);

        this._grid.registerAgGridInitialOptions(this._onAgGridInitialOptions, TASK_GRID_MODULE_PRIORITY.tree);
        this._grid.registerAgGridOptions(this._onAgGridOptions, TASK_GRID_MODULE_PRIORITY.tree);
        services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_GRID_MODULE_PRIORITY.tree);
        services.get('cells').registerCellTheme(this._onCellTheme, TASK_GRID_MODULE_PRIORITY.tree);
        parameters.runtime.registerSettings(this._addSettings);

        services.whenAvailable('gridApi', this._onGridApi);
        this._provider.taskEvents.addEventListener('onTreeChanged', this._onTreeChanged);
        this._provider.taskEvents.addEventListener('onTaskMoved', this._onTaskMoved);
        this._provider.taskEvents.addEventListener('onTasksCreated', this._onTasksCreated);
        this._provider.taskEvents.addEventListener('onTasksUpdated', this._onTasksUpdated);
        this._provider.addEventListener('onNewDataLoaded', this._onNewDataLoaded);
        this._provider.addEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
        this._grid.events.addEventListener('onDestroyed', this._onDestroyed);
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
        this._grid.services.get('state').set<ITaskTreeState>(TASK_TREE_STATE_KEY, { ...this._getState(), isFlatList });
        this._grid.refreshAgGridOptions();
        this._gridApi?.setColumnsVisible([ADD_TASK_COLUMN_KEY], !isFlatList);
        this._gridApi?.refreshCells({ columns: [this._provider.getFieldMapping().subject], force: true });
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
        const subject = this._provider.getFieldMapping().subject;
        const subjectColDef = columnDefs.find(colDef => colDef.colId === subject);
        if (subjectColDef) {
            subjectColDef.cellRenderer = TreeCell;
            subjectColDef.pinned = 'left';
        }
        columnDefs.push({
            colId: ADD_TASK_COLUMN_KEY,
            headerName: '',
            hide: this._isFlatList,
            width: 50,
            pinned: 'left',
            lockPinned: true,
            lockPosition: true,
            resizable: false,
            suppressMovable: true,
            suppressSizeToFit: true,
            cellRenderer: AddTaskCell,
            headerComponent: ExpansionHeader,
        });
        const getOrder = (colDef: ColDef<IRecord>): number => {
            if (LEADING_COLUMN_KEYS.has(colDef.colId!)) {
                return 0;
            }
            return colDef.colId === ADD_TASK_COLUMN_KEY ? 1 : colDef.colId === subject ? 2 : 3;
        };
        columnDefs.sort((left, right) => getOrder(left) - getOrder(right));
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

    private _addSettings = (settings: ITaskGridSetting[]): void => {
        settings.unshift({
            key: 'showHierarchy',
            label: this._runtime.getLabels().getLocalizedString('showHierarchy'),
            isChecked: !this._isFlatList,
            onChange: isChecked => this.setFlatList(!isChecked),
        });
    };

    private _getState(): ITaskTreeState {
        return this._grid.services.get('state').get<ITaskTreeState>(TASK_TREE_STATE_KEY) ?? {};
    }

    private _onNewDataLoaded = (): void => this._expansion.prune();

    private _onTreeChanged = (): void => {
        this._expansion.prune();
        this._grid.services.get('rowModel').refresh();
        this._gridApi?.refreshCells({ columns: [this._provider.getFieldMapping().subject], force: true });
    };

    //AG Grid reads a moved subtree's paths again only for rows it is told were updated
    private _onTaskMoved = (params: ITaskMoveParams): void => {
        const movingId = params.movingRecord.getRecordId();
        const subtree = [params.movingRecord, ...this._provider.getRecordTree().structure.getDescendants(movingId)];
        this._gridApi?.applyTransaction({ update: subtree });
        if (params.position === 'child') {
            this._expansion.setExpanded(params.targetRecord.getRecordId(), true);
        }
        this._provider.clearSelectedRecordIds();
    };

    private _onTasksCreated = (records: IRecord[], parentId?: string): void => {
        if (parentId) {
            this._expansion.setExpanded(parentId, true);
        }
        if (records.length === 1) {
            this._focusNewTask(records[0].getRecordId(), NEW_TASK_FOCUS_ATTEMPTS);
        }
    };

    //AG Grid draws a new row in a later frame, and an edit needs the drawn cell
    private _focusNewTask(recordId: string, attemptsLeft: number): void {
        const gridApi = this._gridApi;
        const node = gridApi?.getRowNode(recordId);
        if (!gridApi || gridApi.isDestroyed() || node?.rowIndex == null) {
            return;
        }
        const subject = this._provider.getFieldMapping().subject;
        gridApi.ensureNodeVisible(node);
        gridApi.setFocusedCell(node.rowIndex, subject);
        if (!this._grid.services.find('editing')) {
            return;
        }
        gridApi.startEditingCell({ rowIndex: node.rowIndex, colKey: subject });
        const isEditing = gridApi.getEditingCells().some(cell => cell.rowIndex === node.rowIndex && cell.colId === subject);
        if (!isEditing && attemptsLeft > 1) {
            requestAnimationFrame(() => this._focusNewTask(recordId, attemptsLeft - 1));
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

    private _onDestroyed = (): void => {
        if (this._runtime.services.find('taskTree') === this) {
            this._runtime.services.unregister('taskTree');
        }
        this._provider.taskEvents.removeEventListener('onTreeChanged', this._onTreeChanged);
        this._provider.taskEvents.removeEventListener('onTaskMoved', this._onTaskMoved);
        this._provider.taskEvents.removeEventListener('onTasksCreated', this._onTasksCreated);
        this._provider.taskEvents.removeEventListener('onTasksUpdated', this._onTasksUpdated);
        this._provider.removeEventListener('onNewDataLoaded', this._onNewDataLoaded);
        this._provider.removeEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
    };
}
