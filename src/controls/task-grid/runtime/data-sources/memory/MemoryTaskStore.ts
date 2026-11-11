import { IAvailableColumnOptions, IAvailableRelatedColumn, IColumn, IMemoryProviderEntityMetadata, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { MemoryTable } from "@core/state";
import type { ITaskRuntime } from "../..";
import { createMemoryTaskTrees } from "./createMemoryTaskTrees";
import { IDeleteTasksResult, IOpenTasksResult, ITaskCreateResult, ITaskCreateParameters, ITaskDeleteParameters, ITaskLoadResult, ITaskStore } from "../../provider/interfaces";

export interface IMemoryTaskStoreParameters {
    taskRuntime: ITaskRuntime;
    /** Where the tasks are kept, keyed by the metadata's `PrimaryIdAttribute`. */
    tasks: MemoryTable<IRawRecord>;
    /** `PrimaryIdAttribute` is required. */
    metadata: IMemoryProviderEntityMetadata;
    /** Every column a view or Edit columns may use. */
    columns: IColumn[];
}

/** Tasks kept in a `MemoryTable`, opened in an alert. */
export class MemoryTaskStore implements ITaskStore {
    protected _parameters: IMemoryTaskStoreParameters;

    constructor(parameters: IMemoryTaskStoreParameters) {
        this._parameters = parameters;
    }

    public async load(): Promise<ITaskLoadResult> {
        const { tasks, metadata, columns } = this._parameters;
        return { rawData: tasks.getRows(), metadata, columns };
    }

    public async getAvailableColumns(options?: IAvailableColumnOptions): Promise<IColumn[]> {
        if (options?.entityName && options.entityName !== this._parameters.metadata.LogicalName) {
            return [];
        }
        return this._parameters.columns.map(column => ({ ...column, isHidden: false }));
    }

    public async getAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return [];
    }

    public async createTask(parameters: ITaskCreateParameters): Promise<ITaskCreateResult | null> {
        const { tasks, taskRuntime, metadata } = this._parameters;
        const data = { ...parameters.data, ...parameters.taskId && { [metadata.PrimaryIdAttribute]: parameters.taskId } };
        const [record] = createMemoryTaskTrees(tasks, taskRuntime, [{ data }], parameters);
        return { record };
    }

    public async deleteTasks(parameters: ITaskDeleteParameters): Promise<IDeleteTasksResult | null> {
        this._parameters.tasks.delete(parameters.taskIds);
        return { success: true, deletedTaskIds: parameters.taskIds };
    }

    public async saveTask(record: IRecord): Promise<IRecordSaveOperationResult> {
        const dirtyFields = record.getFields().filter(field => field.isDirty());
        const values: IRawRecord = {};
        for (const field of dirtyFields) {
            values[field.getColumn().name] = field.getValue();
        }
        this._parameters.tasks.update(record.getRecordId(), values);
        return { recordId: record.getRecordId(), success: true, fields: Object.keys(values) };
    }

    public async openTasks(taskIds: string[]): Promise<IOpenTasksResult | null> {
        const subject = this._parameters.taskRuntime.getProvider().getFieldMapping().subject;
        const names = taskIds.map(taskId => this._parameters.tasks.getRow(taskId)?.[subject] ?? taskId).join(', ');
        await this._parameters.taskRuntime.services.get('pcfContext').navigation.openAlertDialog({ text: `Opening ${names}` });
        return null;
    }

    public async openRelatedRecord(reference: ComponentFramework.EntityReference): Promise<void> {
        await this._parameters.taskRuntime.services.get('pcfContext').navigation.openAlertDialog({ text: `Opening ${reference.name ?? reference.id.guid}` });
    }
}
