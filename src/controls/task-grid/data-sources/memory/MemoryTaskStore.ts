import { IAvailableColumnOptions, IAvailableRelatedColumn, IColumn, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { ITaskRuntime } from "../../runtime";
import { simulateBackend } from "./simulateBackend";
import type { MemoryTaskDatabase } from "./MemoryTaskDatabase";
import { IDeleteTasksResult, IOpenTasksResult, ITaskCreateResult, ITaskCreateParams, ITaskDeleteParams, ITaskLoadResult, ITaskStore } from "../../provider/interfaces";

export interface IMemoryTaskStoreParameters {
    taskRuntime: ITaskRuntime;
    /** Where the tasks are kept; share it with the memory modules that create tasks too. */
    database: MemoryTaskDatabase;
    /** Every column a view or Edit columns may use. */
    columns: IColumn[];
}

/** Tasks held in memory; editing one shows an alert. */
export class MemoryTaskStore implements ITaskStore {
    protected _parameters: IMemoryTaskStoreParameters;

    constructor(parameters: IMemoryTaskStoreParameters) {
        this._parameters = parameters;
    }

    public async onLoad(): Promise<ITaskLoadResult> {
        const { database, columns } = this._parameters;
        return { rawData: database.getTasks(), metadata: database.getMetadata(), columns };
    }

    public async onGetAvailableColumns(options?: IAvailableColumnOptions): Promise<IColumn[]> {
        if (options?.entityName && options.entityName !== this._parameters.database.getMetadata().LogicalName) {
            return [];
        }
        return this._parameters.columns.map(column => ({ ...column, isHidden: false }));
    }

    public async onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return [];
    }

    public async onCreateTask(params: ITaskCreateParams): Promise<ITaskCreateResult | null> {
        await simulateBackend();
        const { database, taskRuntime } = this._parameters;
        const provider = taskRuntime.getProvider();
        const data = { ...params.data, ...params.taskId && { [provider.getMetadata().PrimaryIdAttribute!]: params.taskId } };
        const [record] = database.createTasks([{ data }], params, { fieldMapping: provider.getFieldMapping(), columns: provider.getColumns() });
        return { record };
    }

    public async onDeleteTasks(params: ITaskDeleteParams): Promise<IDeleteTasksResult | null> {
        await simulateBackend();
        this._parameters.database.deleteTasks(params.taskIds);
        return { success: true, deletedTaskIds: params.taskIds };
    }

    public async onSaveTask(record: IRecord): Promise<IRecordSaveOperationResult> {
        const dirtyFields = record.getFields().filter(field => field.isDirty());
        const values: IRawRecord = {};
        for (const field of dirtyFields) {
            values[field.getColumn().name] = field.getValue();
        }
        this._parameters.database.updateTask(record.getRecordId(), values);
        return { recordId: record.getRecordId(), success: true, fields: Object.keys(values) };
    }

    public async onOpenTasks(taskIds: string[]): Promise<IOpenTasksResult | null> {
        await simulateBackend();
        const subject = this._parameters.taskRuntime.getProvider().getFieldMapping().subject;
        const names = taskIds.map(taskId => this._parameters.database.getTask(taskId)?.[subject] ?? taskId).join(', ');
        await this._parameters.taskRuntime.services.get('pcfContext').navigation.openAlertDialog({ text: `Opening ${names}` });
        return null;
    }

    public async onOpenRelatedRecord(reference: ComponentFramework.EntityReference): Promise<void> {
        await simulateBackend();
        await this._parameters.taskRuntime.services.get('pcfContext').navigation.openAlertDialog({ text: `Opening ${reference.name ?? reference.id.guid}` });
    }
}
