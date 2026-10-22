import { DatasetConstants, IColumn, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { ICommandBarItemProps } from "@legacy";
import type { DatasetControlEditColumnsSession, IDatasetControlEditColumns } from "@controls/dataset-control/components/adapters/edit-columns";
import { ErrorHelper, ILocalizationService, LocalizationService } from "@utils";
import type { ITaskDataProvider } from "../../provider";
import type { ITaskDatasetControlRuntime } from "../../runtime";
import { CUSTOM_COLUMNS_LABELS, ICustomColumnsLabels } from "./labels";

/** Where custom column definitions and values are kept. */
export interface ICustomColumnsStrategy {
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
    strategy: ICustomColumnsStrategy;
    /** The Add custom column command in Edit columns. */
    enableCreation?: boolean;
    /** The edit command on each custom column in Edit columns. */
    enableEditing?: boolean;
    /** The delete command on each custom column in Edit columns. */
    enableDeletion?: boolean;
    /** Overrides for the module's strings. */
    labels?: Partial<ICustomColumnsLabels>;
}

/** The user's own task columns: offered in Edit columns, and loaded and saved through their strategy. */
export class CustomColumns {
    private _taskDatasetControl: ITaskDatasetControlRuntime;
    private _parameters: ICustomColumnsParameters;
    private _labels: ILocalizationService<ICustomColumnsLabels>;
    private _columns: IColumn[] = [];
    private _unregisters: (() => void)[] = [];

    constructor(taskDatasetControl: ITaskDatasetControlRuntime, parameters: ICustomColumnsParameters) {
        this._taskDatasetControl = taskDatasetControl;
        this._parameters = parameters;
        this._labels = new LocalizationService<ICustomColumnsLabels>({ ...CUSTOM_COLUMNS_LABELS, ...parameters.labels });
    }

    /** Loads the definitions and plugs the columns into the provider and Edit columns. */
    public async load(): Promise<void> {
        this._columns = await this._parameters.strategy.onLoadColumns();
        this._taskDatasetControl.services.whenAvailable('provider', this._onProviderAvailable);
        this._taskDatasetControl.services.get('datasetControl').parts.whenAvailable('editColumns', this._onEditColumnsAvailable);
    }

    public getColumns(): IColumn[] {
        return this._columns;
    }

    public isCustomColumn(columnName: string): boolean {
        return columnName.endsWith(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX);
    }

    public getLabels(): ILocalizationService<ICustomColumnsLabels> {
        return this._labels;
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): void => {
        const strategy = this._parameters.strategy;
        this._unregisters.push(
            provider.registerColumnHandler({
                isHandledColumn: columnName => this.isCustomColumn(columnName),
                onLoadValues: taskIds => strategy.onLoadValues(taskIds),
                onSaveValue: (record, column, value) => strategy.onSaveValue(record, column, value),
            }),
            provider.registerAvailableColumns(this._addAvailableColumns),
        );
    };

    //over the bare virtual column a FetchXML strategy hands back for one
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
            commands.push({ key: 'addCustomColumn', text: this._labels.getLocalizedString('addCustomColumn'), iconProps: { iconName: 'Add' }, onClick: () => { this._createColumn(session); } });
        }
    };

    //dnd-kit swallows the click, so they act on mouse up
    private _addColumnCommands = (commands: ICommandBarItemProps[], column: IColumn, session: DatasetControlEditColumnsSession): void => {
        if (!this.isCustomColumn(column.name)) {
            return;
        }
        if (this._parameters.enableEditing) {
            commands.unshift({ key: 'editCustomColumn', title: this._labels.getLocalizedString('editCustomColumn'), iconProps: { iconName: 'Edit' }, onMouseUp: () => { this._updateColumn(column.name, session); } });
        }
        if (this._parameters.enableDeletion) {
            commands.push({ key: 'deleteCustomColumn', title: this._labels.getLocalizedString('deleteCustomColumn'), iconProps: { iconName: 'Delete' }, onMouseUp: () => { this._deleteColumn(column.name, session); } });
        }
    };

    private async _createColumn(session: DatasetControlEditColumnsSession): Promise<void> {
        await this._run(async () => {
            const columnName = await this._parameters.strategy.onCreateColumn();
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
            if (!await this._parameters.strategy.onUpdateColumn(columnName)) {
                return;
            }
            await this._reloadColumns();
            await session.refreshColumns();
        });
    }

    private async _deleteColumn(columnName: string, session: DatasetControlEditColumnsSession): Promise<void> {
        const navigation = this._taskDatasetControl.services.get('pcfContext').navigation;
        const confirmation = await navigation.openConfirmDialog({ text: this._labels.getLocalizedString('confirmColumnDelete') });
        if (!confirmation.confirmed) {
            return;
        }
        await this._run(async () => {
            if (!await this._parameters.strategy.onDeleteColumn(columnName)) {
                return;
            }
            await this._reloadColumns();
            session.removeColumn(columnName);
        });
    }

    private async _reloadColumns(): Promise<void> {
        this._columns = await this._parameters.strategy.onLoadColumns();
    }

    //the commands do not await them
    private async _run(operation: () => Promise<void>): Promise<void> {
        try {
            await operation();
        }
        catch (error) {
            await this._taskDatasetControl.services.get('pcfContext').navigation.openErrorDialog({ message: this._labels.getLocalizedString('customColumnsFailed'), details: ErrorHelper.getMessageFromError(error) });
        }
    }
}
