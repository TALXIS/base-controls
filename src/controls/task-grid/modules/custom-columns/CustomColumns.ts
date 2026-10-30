import { DatasetConstants, IColumn, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { ICommandBarItemProps } from "@legacy";
import type { DatasetControlEditColumnsSession, IDatasetControlEditColumns } from "@controls/dataset-control/components/adapters/edit-columns";
import { ErrorHelper, type LabelsOf } from "@utils";
import type { ITaskDataProvider } from "../../provider";
import type { ITaskRuntime } from "../../runtime";
import { TaskColumnValues } from "../column-values";
import { CUSTOM_COLUMNS_LABELS } from "./labels";

/** Where custom column definitions and values are kept. */
export interface ICustomColumnsStore {
    /** Loads the column definitions; called on every mount, before the tasks load. */
    onLoadColumns(): Promise<IColumn[]>;
    /** The custom columns' values of these tasks, by task id and column name. */
    onLoadValues(taskIds: string[]): Promise<Map<string, IRawRecord>>;
    onSaveValue(record: IRecord, column: IColumn, value: unknown): Promise<IRecordSaveOperationResult>;
    /** @returns The new column's name, or `null` when the user cancelled. */
    onCreateColumn(): Promise<string | null>;
    /** @returns The column's name, or `null` when the user cancelled. */
    onUpdateColumn(columnName: string): Promise<string | null>;
    /** @returns The column's name, or `null` when the user cancelled. */
    onDeleteColumn(columnName: string): Promise<string | null>;
}

export interface ICustomColumnsParameters {
    onCreateStore: (taskRuntime: ITaskRuntime) => ICustomColumnsStore;
    /** The Add custom column command in Edit columns. */
    enableCreation?: boolean;
    /** The edit command on each custom column in Edit columns. */
    enableEditing?: boolean;
    /** The delete command on each custom column in Edit columns. */
    enableDeletion?: boolean;
}

/** The user's own task columns: offered in Edit columns, and loaded and saved through their store. */
export class CustomColumns {
    private _taskRuntime: ITaskRuntime;
    private _parameters: ICustomColumnsParameters;
    private _store: ICustomColumnsStore;
    private _labels: LabelsOf<typeof CUSTOM_COLUMNS_LABELS>;
    private _columns: IColumn[] = [];
    private _values: TaskColumnValues;
    private _unregisters: (() => void)[] = [];

    constructor(taskRuntime: ITaskRuntime, parameters: ICustomColumnsParameters) {
        this._taskRuntime = taskRuntime;
        this._parameters = parameters;
        this._store = parameters.onCreateStore(taskRuntime);
        this._labels = taskRuntime.getLabels(CUSTOM_COLUMNS_LABELS);
        this._values = new TaskColumnValues({
            taskRuntime,
            columnNames: () => this._columns.map(column => column.name),
            onLoad: this._loadValues,
            errorMessage: () => this._labels.get('customColumns.loadCustomColumnsFailed'),
        });
    }

    /** Loads the definitions and plugs the columns into the provider and Edit columns. */
    public async load(): Promise<void> {
        this._columns = await this._store.onLoadColumns();
        this._taskRuntime.services.whenAvailable('provider', this._onProviderAvailable);
        this._taskRuntime.services.get('datasetControl').parts.whenAvailable('editColumns', this._onEditColumnsAvailable);
    }

    public getColumns(): IColumn[] {
        return this._columns;
    }

    public isCustomColumn(columnName: string): boolean {
        return columnName.endsWith(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX);
    }

    /** What the last load threw, until the next one starts. */
    public getError(): unknown {
        return this._values.getError();
    }

    /** Loads the tasks' custom column values again, every loaded task's when none are given. */
    public reload(taskIds?: string[]): Promise<void> {
        return this._values.reload(taskIds);
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
        this._values.destroy();
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): void => {
        const store = this._store;
        this._unregisters.push(
            provider.registerColumnHandler({
                isHandledColumn: columnName => this.isCustomColumn(columnName),
                onSaveValue: (record, column, value) => store.onSaveValue(record, column, value),
            }),
            provider.registerAvailableColumns(this._addAvailableColumns),
        );
    };

    //a task the store leaves out holds none
    private _loadValues = async (taskIds: string[]): Promise<Map<string, IRawRecord>> => {
        const loaded = await this._store.onLoadValues(taskIds);
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
        this._unregisters.push(
            editColumns.registerCommands(this._addCommands),
            editColumns.registerColumnCommands(this._addColumnCommands),
        );
    };

    private _addCommands = (commands: ICommandBarItemProps[], session: DatasetControlEditColumnsSession): void => {
        if (this._parameters.enableCreation) {
            commands.push({ key: 'addCustomColumn', text: this._labels.get('customColumns.addCustomColumn'), iconProps: { iconName: 'Add' }, onClick: () => { this._createColumn(session); } });
        }
    };

    //dnd-kit swallows the click, so they act on mouse up
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
            const columnName = await this._store.onCreateColumn();
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
            if (!await this._store.onUpdateColumn(columnName)) {
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
            if (!await this._store.onDeleteColumn(columnName)) {
                return;
            }
            await this._reloadColumns();
            session.removeColumn(columnName);
        });
    }

    private async _reloadColumns(): Promise<void> {
        this._columns = await this._store.onLoadColumns();
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
