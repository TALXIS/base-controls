import { IAvailableColumnOptions, IAvailableRelatedColumn, IColumn, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { ITaskRuntime } from "../..";
import { simulateBackend } from "./simulateBackend";
import type { MemoryTaskDatabase } from "./MemoryTaskDatabase";
import { IDeleteTasksResult, IOpenTasksResult, ITaskCreateResult, ITaskCreateParameters, ITaskDeleteParameters, ITaskLoadResult, ITaskStore } from "../../provider/interfaces";

export interface IMemoryTaskStoreParameters {
    taskRuntime: ITaskRuntime;
    /** Where the tasks are kept, shared with the memory modules that create tasks. */
    database: MemoryTaskDatabase;
    /** Every column a view or Edit columns may use. */
    columns: IColumn[];
}

/** Tasks held in memory, opened in an alert. */
export class MemoryTaskStore implements ITaskStore {
    protected _parameters: IMemoryTaskStoreParameters;

    constructor(parameters: IMemoryTaskStoreParameters) {
        this._parameters = parameters;
    }

    public async load(): Promise<ITaskLoadResult> {
        const { database, columns } = this._parameters;
        return { rawData: database.getTasks(), metadata: database.getMetadata(), columns };
    }

    public async getAvailableColumns(options?: IAvailableColumnOptions): Promise<IColumn[]> {
        if (options?.entityName && options.entityName !== this._parameters.database.getMetadata().LogicalName) {
            return [];
        }
        return this._parameters.columns.map(column => ({ ...column, isHidden: false }));
    }

    public async getAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return [];
    }

    public async createTask(parameters: ITaskCreateParameters): Promise<ITaskCreateResult | null> {
        await simulateBackend();
        const { database, taskRuntime } = this._parameters;
        const provider = taskRuntime.getProvider();
        const data = { ...parameters.data, ...parameters.taskId && { [provider.getMetadata().PrimaryIdAttribute!]: parameters.taskId } };
        const [record] = database.createTasks([{ data }], parameters, { fieldMapping: provider.getFieldMapping(), columns: provider.getColumns() });
        return { record };
    }

    public async deleteTasks(parameters: ITaskDeleteParameters): Promise<IDeleteTasksResult | null> {
        await simulateBackend();
        this._parameters.database.deleteTasks(parameters.taskIds);
        return { success: true, deletedTaskIds: parameters.taskIds };
    }

    public async saveTask(record: IRecord): Promise<IRecordSaveOperationResult> {
        const dirtyFields = record.getFields().filter(field => field.isDirty());
        const values: IRawRecord = {};
        for (const field of dirtyFields) {
            values[field.getColumn().name] = field.getValue();
        }
        this._parameters.database.updateTask(record.getRecordId(), values);
        return { recordId: record.getRecordId(), success: true, fields: Object.keys(values) };
    }

    public async openTasks(taskIds: string[]): Promise<IOpenTasksResult | null> {
        await simulateBackend();
        const subject = this._parameters.taskRuntime.getProvider().getFieldMapping().subject;
        const names = taskIds.map(taskId => this._parameters.database.getTask(taskId)?.[subject] ?? taskId).join(', ');
        await this._parameters.taskRuntime.services.get('pcfContext').navigation.openAlertDialog({ text: `Opening ${names}` });
        return null;
    }

    public async openRelatedRecord(reference: ComponentFramework.EntityReference): Promise<void> {
        await simulateBackend();
        await this._parameters.taskRuntime.services.get('pcfContext').navigation.openAlertDialog({ text: `Opening ${reference.name ?? reference.id.guid}` });
    }
}
