import type { IRawRecord } from "@talxis/client-libraries";
import type { GridCellLoadingHook, IGrid } from "@controls/grid";
import type { ITaskDataProvider, TaskLoadWaiter } from "../provider";
import type { ITaskRuntime } from "..";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";

export interface ITaskColumnValuesParameters {
    taskRuntime: ITaskRuntime;
    /** The columns the values fill. */
    columnNames: () => string[];
    /** Fetches the tasks' values by task id and column name, or writes them itself. */
    load: (taskIds: string[]) => Promise<Map<string, IRawRecord> | void>;
    /** What a failed load is kept as. */
    errorMessage: () => string;
    /** Loads a task's values again once its editor closes. */
    reloadOnEditorClosed?: boolean;
}

/** Loads values kept apart from the tasks after the tasks, or first when a query needs them. */
export class TaskColumnValues {
    private _parameters: ITaskColumnValuesParameters;
    private _grid?: IGrid<ITaskGridServiceMap>;
    private _loadingCount = 0;
    private _lastLoadId = 0;
    private _hasStartedLoading = false;
    private _taskLoads = new Map<string, Promise<void>>();
    private _error?: unknown;

    constructor(parameters: ITaskColumnValuesParameters) {
        this._parameters = parameters;
        parameters.taskRuntime.services.observe('provider', this._onProviderAvailable);
        parameters.taskRuntime.services.get('datasetControl').parts.observe('grid', this._onGridAvailable);
    }

    public isLoading(): boolean {
        return this._loadingCount > 0;
    }

    /** What the last load threw, until the next one starts. */
    public getError(): unknown {
        return this._error;
    }

    /** Loads the tasks' values again, every loaded task's when none are given. */
    public reload(taskIds?: string[]): Promise<void> {
        return this._load(taskIds ?? Object.keys(this._parameters.taskRuntime.getProvider().getRecordsMap()));
    }

    /** Writes values onto the tasks by task id. */
    public write(values: Map<string, IRawRecord>): void {
        const provider = this._parameters.taskRuntime.getProvider();
        const primaryIdAttribute = provider.getMetadata().PrimaryIdAttribute!;
        provider.updateTaskData([...values].map(([taskId, taskValues]) => ({ ...taskValues, [primaryIdAttribute]: taskId })));
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): (() => void) => {
        const offFirstDataLoaded = provider.addEventListener('onFirstDataLoaded', this._onFirstDataLoaded);
        const removeLoadWaiter = provider.addLoadWaiter(this._waitForValues);
        const offEditorClosed = this._parameters.reloadOnEditorClosed ? provider.taskEvents.addEventListener('onEditorClosed', this._onEditorClosed) : undefined;
        return () => {
            offFirstDataLoaded();
            removeLoadWaiter();
            offEditorClosed?.();
        };
    };

    private _onEditorClosed = (taskIds: string[]): void => {
        this.reload(taskIds);
    };

    private _onFirstDataLoaded = (): void => {
        if (!this._hasStartedLoading) {
            this.reload();
        }
    };

    //a sort, filter or search on these columns has to see the values
    private _waitForValues: TaskLoadWaiter = async params => {
        const provider = this._parameters.taskRuntime.getProvider();
        if (this._parameters.columnNames().some(columnName => provider.isColumnQueried(columnName))) {
            const notLoadedTaskIds = params.taskIds.filter(taskId => !this._taskLoads.has(taskId));
            this._load(notLoadedTaskIds);
            await Promise.all(params.taskIds.map(taskId => this._taskLoads.get(taskId)));
        }
    };

    private _load(taskIds: string[]): Promise<void> {
        this._hasStartedLoading = true;
        const load = this._loadValues(taskIds);
        taskIds.forEach(taskId => this._taskLoads.set(taskId, load));
        return load;
    }

    private async _loadValues(taskIds: string[]): Promise<void> {
        if (taskIds.length === 0) {
            return;
        }
        const loadId = ++this._lastLoadId;
        this._error = undefined;
        this._changeLoadingCount(1);
        try {
            const values = await this._parameters.load(taskIds);
            if (values) {
                this.write(values);
            }
        }
        catch (error) {
            if (loadId === this._lastLoadId) {
                this._error = new Error(this._parameters.errorMessage(), { cause: error });
            }
        }
        finally {
            this._changeLoadingCount(-1);
        }
    }

    //the cells read the loading state while they draw
    private _changeLoadingCount(change: number): void {
        this._loadingCount += change;
        this._grid?.services.get('cells').render({ columnNames: this._parameters.columnNames() });
    }

    private _onGridAvailable = (grid: IGrid): (() => void) => {
        this._grid = grid as IGrid<ITaskGridServiceMap>;
        grid.services.get('cells').addCellLoadingHook(this._onCellLoading, TASK_GRID_PRIORITY.tree + 20);
        return () => this._grid = undefined;
    };

    private _onCellLoading: GridCellLoadingHook = (result, params) => {
        if (this.isLoading() && this._parameters.columnNames().includes(params.columnName)) {
            result.isLoading = true;
        }
    };
}
