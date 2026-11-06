import { DatasetConstants, IColumn, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { ICommandBarItemProps } from "@legacy";
import type { DatasetControlEditColumnsSession, IDatasetControlEditColumns } from "@controls/dataset-control/adapters/edit-columns";
import { ErrorHelper } from "@core";
import { type LabelsOf } from "@labels";
import type { ITaskDataProvider } from "../../runtime/provider";
import type { ITaskRuntime } from "../../runtime";
import { TaskColumnValues } from "../../runtime/column-values";
import { CUSTOM_COLUMNS_LABELS } from "./labels";

/** Where custom column definitions and values are kept. */
export interface ICustomColumnsStore {
    /** Loads the column definitions on every mount, before the tasks load. */
    loadColumns(): Promise<IColumn[]>;
    /** The custom columns' values of these tasks, by task id and column name. */
    loadValues(taskIds: string[]): Promise<Map<string, IRawRecord>>;
    saveValue(record: IRecord, column: IColumn, value: unknown): Promise<IRecordSaveOperationResult>;
    /** @returns The new column's name, or `null` when the user cancelled. */
    createColumn(): Promise<string | null>;
    /** @returns The column's name, or `null` when the user cancelled. */
    updateColumn(columnName: string): Promise<string | null>;
    /** @returns The column's name, or `null` when the user cancelled. */
    deleteColumn(columnName: string): Promise<string | null>;
    /** Called as the custom columns go. */
    destroy?(): void;
}

export interface ICustomColumnsParameters {
    createStore: (taskRuntime: ITaskRuntime) => ICustomColumnsStore;
    /** The Add custom column command in Edit columns. */
    enableCreation?: boolean;
    /** The edit command on each custom column in Edit columns. */
    enableEditing?: boolean;
    /** The delete command on each custom column in Edit columns. */
    enableDeletion?: boolean;
}

/** The `customColumns` module, loaded and saved through its store. */
export interface ICustomColumns {
    getColumns(): IColumn[];
    isCustomColumn(columnName: string): boolean;
    /** What the last load threw, until the next one starts. */
    getError(): unknown;
    /** Loads the tasks' custom column values again, every loaded task's when none are given. */
    reload(taskIds?: string[]): Promise<void>;
    /** Called as the mount goes. */
    destroy(): void;
}

/** The user's own task columns, offered in Edit columns. */
export class CustomColumns implements ICustomColumns {
    private _taskRuntime: ITaskRuntime;
    private _parameters: ICustomColumnsParameters;
    private _store: ICustomColumnsStore;
    private _columns: IColumn[] = [];
    private _values: TaskColumnValues;

    constructor(taskRuntime: ITaskRuntime, parameters: ICustomColumnsParameters) {
        this._taskRuntime = taskRuntime;
        this._parameters = parameters;
        this._store = parameters.createStore(taskRuntime);
        this._values = new TaskColumnValues({
            taskRuntime,
            columnNames: () => this._columns.map(column => column.name),
            load: this._loadValues,
            errorMessage: () => this._labels.get('customColumns.loadCustomColumnsFailed'),
        });
    }

    private get _labels(): LabelsOf<typeof CUSTOM_COLUMNS_LABELS> {
        return this._taskRuntime.getLabels(CUSTOM_COLUMNS_LABELS);
    }

    /** Loads the definitions and plugs the columns into the provider and Edit columns. */
    public async load(): Promise<void> {
        this._columns = await this._store.loadColumns();
        this._taskRuntime.services.observe('provider', this._onProviderAvailable);
        this._taskRuntime.services.get('datasetControl').parts.observe('editColumns', this._onEditColumnsAvailable);
    }

    public getColumns(): IColumn[] {
        return this._columns;
    }

    public isCustomColumn(columnName: string): boolean {
        return columnName.endsWith(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX);
    }

    public getError(): unknown {
        return this._values.getError();
    }

    public reload(taskIds?: string[]): Promise<void> {
        return this._values.reload(taskIds);
    }

    public destroy(): void {
        this._store.destroy?.();
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): (() => void) => {
        const removers = [
            provider.addColumnHandler({
                isHandledColumn: columnName => this.isCustomColumn(columnName),
                saveValue: (record, column, value) => this._store.saveValue(record, column, value),
            }),
            provider.addAvailableColumnsHook(this._addAvailableColumns),
        ];
        return () => removers.forEach(remove => remove());
    };

    //a task the store leaves out holds none
    private _loadValues = async (taskIds: string[]): Promise<Map<string, IRawRecord>> => {
        const loaded = await this._store.loadValues(taskIds);
        const empty = Object.fromEntries(this._columns.map(column => [column.name, null]));
        return new Map(taskIds.map(taskId => [taskId, { ...empty, ...loaded.get(taskId) }]));
    };

    //over the bare virtual column a FetchXML store hands back for one
    private _addAvailableColumns = (columns: IColumn[]): void => {
        for (const column of this._columns) {
            const index = columns.findIndex(existing => existing.name === column.name);
            if (index === -1) {
                columns.push(column);
            }
            else {
                columns[index] = column;
            }
        }
    };

    private _onEditColumnsAvailable = (editColumns: IDatasetControlEditColumns): void => {
        editColumns.addCommandsHook(this._addCommands);
        editColumns.addColumnCommandsHook(this._addColumnCommands);
    };

    private _addCommands = (commands: ICommandBarItemProps[], session: DatasetControlEditColumnsSession): void => {
        if (this._parameters.enableCreation) {
            commands.push({ key: 'addCustomColumn', text: this._labels.get('customColumns.addCustomColumn'), iconProps: { iconName: 'Add' }, onClick: () => { this._createColumn(session); } });
        }
    };

    //dnd-kit swallows the click
    private _addColumnCommands = (commands: ICommandBarItemProps[], column: IColumn, session: DatasetControlEditColumnsSession): void => {
        if (!this.isCustomColumn(column.name)) {
            return;
        }
        if (this._parameters.enableEditing) {
            commands.unshift({ key: 'editCustomColumn', title: this._labels.get('customColumns.editCustomColumn'), iconProps: { iconName: 'Edit' }, onMouseUp: () => { this._updateColumn(column.name, session); } });
        }
        if (this._parameters.enableDeletion) {
            commands.push({ key: 'deleteCustomColumn', title: this._labels.get('customColumns.deleteCustomColumn'), iconProps: { iconName: 'Delete' }, onMouseUp: () => { this._deleteColumn(column.name, session); } });
        }
    };

    private async _createColumn(session: DatasetControlEditColumnsSession): Promise<void> {
        await this._run(async () => {
            const columnName = await this._store.createColumn();
            if (!columnName) {
                return;
            }
            await this._reloadColumns();
            const column = this._columns.find(column => column.name === columnName);
            if (column) {
                session.addColumn(column);
            }
        });
    }

    private async _updateColumn(columnName: string, session: DatasetControlEditColumnsSession): Promise<void> {
        await this._run(async () => {
            if (!await this._store.updateColumn(columnName)) {
                return;
            }
            await this._reloadColumns();
            await session.refreshColumns();
        });
    }

    private async _deleteColumn(columnName: string, session: DatasetControlEditColumnsSession): Promise<void> {
        const navigation = this._taskRuntime.services.get('pcfContext').navigation;
        const confirmation = await navigation.openConfirmDialog({ text: this._labels.get('customColumns.confirmColumnDelete') });
        if (!confirmation.confirmed) {
            return;
        }
        await this._run(async () => {
            if (!await this._store.deleteColumn(columnName)) {
                return;
            }
            await this._reloadColumns();
            session.removeColumn(columnName);
        });
    }

    private async _reloadColumns(): Promise<void> {
        this._columns = await this._store.loadColumns();
        await this.reload();
    }

    //the commands do not await them
    private async _run(operation: () => Promise<void>): Promise<void> {
        try {
            await operation();
        }
        catch (error) {
            await this._taskRuntime.services.get('pcfContext').navigation.openErrorDialog({ message: this._labels.get('customColumns.customColumnsFailed'), details: ErrorHelper.getMessageFromError(error) });
        }
    }
}
