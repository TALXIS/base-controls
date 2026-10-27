import { IAvailableColumnOptions, IAvailableRelatedColumn, IColumn, IMemoryProviderEntityMetadata, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { StackRank } from "@utils/stack-rank";
import type { ITaskRuntime } from "../../runtime";
import { simulateBackend } from "./simulateBackend";
import { IDeleteTasksResult, IFieldMapping, IEditTasksResult, ITaskChanges, ITaskCreateResult, ITaskCreateParams, ITaskDeleteParams, ITaskLoadResult, ITaskMoveParams, ITaskStore } from "../../provider/interfaces";

export interface IMemoryTaskStoreParameters {
    taskRuntime: ITaskRuntime;
    /** The tasks to start with; copied, so changes never reach this array. */
    records: IRawRecord[];
    /** `PrimaryIdAttribute` is required. */
    metadata: IMemoryProviderEntityMetadata;
    /** Every column a view or Edit columns may use. */
    columns: IColumn[];
}

/** Tasks held in memory; editing one shows an alert. */
export class MemoryTaskStore implements ITaskStore {
    protected _parameters: IMemoryTaskStoreParameters;
    protected _tasks: IRawRecord[];

    constructor(parameters: IMemoryTaskStoreParameters) {
        this._parameters = parameters;
        this._tasks = structuredClone(parameters.records);
    }

    public async onLoad(): Promise<ITaskLoadResult> {
        return { rawData: structuredClone(this._tasks), metadata: this._parameters.metadata, columns: this._parameters.columns };
    }

    public async onGetAvailableColumns(options?: IAvailableColumnOptions): Promise<IColumn[]> {
        if (options?.entityName && options.entityName !== this._parameters.metadata.LogicalName) {
            return [];
        }
        return this._parameters.columns.map(column => ({ ...column, isHidden: false }));
    }

    public async onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return [];
    }

    public async onCreateTask(params: ITaskCreateParams): Promise<ITaskCreateResult | null> {
        await simulateBackend();
        const { fieldMapping, metadata } = params;
        const task: IRawRecord = {};
        for (const column of params.columns) {
            task[column.name] = null;
        }
        Object.assign(task, params.data);
        task[metadata.PrimaryIdAttribute!] = crypto.randomUUID();
        task[fieldMapping.parentId] = this._getParentReference(params.parentRecord);
        task[fieldMapping.stackRank] = this._getStackRank(params.previousSibling, params.nextSibling, fieldMapping);
        task[fieldMapping.stateCode] ??= 0;
        this._tasks.push(task);
        return { record: structuredClone(task) };
    }

    public async onDeleteTasks(params: ITaskDeleteParams): Promise<IDeleteTasksResult | null> {
        await simulateBackend();
        const deletedTaskIds = new Set(params.taskIds);
        const primaryIdAttribute = this._parameters.metadata.PrimaryIdAttribute!;
        this._tasks = this._tasks.filter(task => !deletedTaskIds.has(task[primaryIdAttribute]));
        return { success: true, deletedTaskIds: params.taskIds };
    }

    public async onMoveTask(params: ITaskMoveParams): Promise<ITaskChanges | null> {
        await simulateBackend();
        const { parentId, stackRank } = params.fieldMapping;
        this._write(params.movingRecord.getRecordId(), { [parentId]: this._getParentReference(params.parentRecord), [stackRank]: params.stackRank });
        return {};
    }

    public async onSaveRecord(record: IRecord): Promise<IRecordSaveOperationResult> {
        const dirtyFields = record.getFields().filter(field => field.isDirty());
        const values: IRawRecord = {};
        for (const field of dirtyFields) {
            values[field.getColumn().name] = field.getValue();
        }
        this._write(record.getRecordId(), values);
        return { recordId: record.getRecordId(), success: true, fields: Object.keys(values) };
    }

    public async onEditTasks(taskIds: string[]): Promise<IEditTasksResult | null> {
        await simulateBackend();
        const subject = this._parameters.taskRuntime.getProvider().getFieldMapping().subject;
        const names = taskIds.map(taskId => this._find(taskId)?.[subject] ?? taskId).join(', ');
        await this._parameters.taskRuntime.services.get('pcfContext').navigation.openAlertDialog({ text: `Opening ${names}` });
        return null;
    }

    public async onOpenRelatedRecord(reference: ComponentFramework.EntityReference): Promise<void> {
        await simulateBackend();
        await this._parameters.taskRuntime.services.get('pcfContext').navigation.openAlertDialog({ text: `Opening ${reference.name ?? reference.id.guid}` });
    }

    protected _find(taskId: string): IRawRecord | undefined {
        return this._tasks.find(task => task[this._parameters.metadata.PrimaryIdAttribute!] === taskId);
    }

    protected _write(taskId: string, values: IRawRecord): void {
        const task = this._find(taskId);
        if (task) {
            Object.assign(task, structuredClone(values));
        }
    }

    protected _getParentReference(parent?: IRecord): ComponentFramework.EntityReference[] | null {
        return parent ? [parent.getNamedReference()] : null;
    }

    protected _getStackRank(previousSibling: IRecord | undefined, nextSibling: IRecord | undefined, fieldMapping: IFieldMapping): string {
        return StackRank.between(previousSibling?.getValue(fieldMapping.stackRank), nextSibling?.getValue(fieldMapping.stackRank));
    }
}
