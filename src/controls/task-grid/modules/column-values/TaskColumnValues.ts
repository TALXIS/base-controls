import type { IRawRecord } from "@talxis/client-libraries";
import type { GridCellLoadingHook, IGrid } from "@controls/grid";
import type { ITaskDataProvider, TaskLoadWaiter } from "../../provider";
import type { ITaskRuntime } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";

export interface ITaskColumnValuesParameters {
    taskRuntime: ITaskRuntime;
    /** The columns the values fill: a query on one waits for them, and they show loading. */
    columnNames: () => string[];
    /**
     * Fetches the tasks' values, by task id and column name; they are written onto the tasks.
     * A module that writes its values itself returns nothing.
     */
    onLoad: (taskIds: string[]) => Promise<Map<string, IRawRecord> | void>;
    /** What a failed load is kept as. */
    errorMessage: () => string;
}

/** Loads values kept apart from the tasks after the tasks, unless a query needs them first, and shows them loading. */
export class TaskColumnValues {
    private _parameters: ITaskColumnValuesParameters;
    private _grid?: IGrid<ITaskGridServiceMap>;
    private _isLoading = false;
    private _hasStartedLoading = false;
    private _currentLoad?: Promise<void>;
    private _error?: unknown;
    private _unregisters: (() => void)[] = [];

    constructor(parameters: ITaskColumnValuesParameters) {
        this._parameters = parameters;
        parameters.taskRuntime.services.whenAvailable('provider', this._onProviderAvailable);
        parameters.taskRuntime.services.get('datasetControl').parts.whenAvailable('grid', grid => this._onGridAvailable(grid as IGrid<ITaskGridServiceMap>));
    }

    public isLoading(): boolean {
        return this._isLoading;
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

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): void => {
        provider.addEventListener('onFirstDataLoaded', this._onFirstDataLoaded);
        this._unregisters.push(
            provider.registerLoadWaiter(this._waitForValues),
            () => provider.removeEventListener('onFirstDataLoaded', this._onFirstDataLoaded),
        );
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
            await (this._hasStartedLoading ? this._currentLoad : this._load(params.taskIds));
        }
    };

    private _load(taskIds: string[]): Promise<void> {
        this._hasStartedLoading = true;
        this._currentLoad = this._loadValues(taskIds);
        return this._currentLoad;
    }

    private async _loadValues(taskIds: string[]): Promise<void> {
        if (taskIds.length === 0) {
            return;
        }
        this._error = undefined;
        this._setLoading(true);
        try {
            const values = await this._parameters.onLoad(taskIds);
            if (values) {
                this.write(values);
            }
        }
        catch (error) {
            this._error = new Error(this._parameters.errorMessage(), { cause: error });
        }
        finally {
            this._setLoading(false);
        }
    }

    //the cells read the loading state while they draw
    private _setLoading(isLoading: boolean): void {
        this._isLoading = isLoading;
        this._grid?.services.get('cells').render({ columnNames: this._parameters.columnNames() });
    }

    private _onGridAvailable(grid: IGrid<ITaskGridServiceMap>): void {
        this._grid = grid;
        this._unregisters.push(grid.services.get('cells').registerCellLoading(this._onCellLoading, TASK_GRID_PRIORITY.tree + 20));
    }

    private _onCellLoading: GridCellLoadingHook = (result, params) => {
        if (this._isLoading && this._parameters.columnNames().includes(params.columnName)) {
            result.isLoading = true;
        }
    };
}
