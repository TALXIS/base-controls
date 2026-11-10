import { IAvailableColumnOptions, IAvailableRelatedColumn, IColumn, IMemoryProviderEntityMetadata, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { MemoryTable } from "@core/state";
import { StackRank } from "@core/stack-rank";
import type { ITaskRuntime } from "../..";
import { simulateBackend } from "./simulateBackend";
import { ICreateTaskTree, IDeleteTasksResult, IOpenTasksResult, ITaskCreateResult, ITaskCreateParameters, ITaskDeleteParameters, ITaskLoadResult, ITaskStore } from "../../provider/interfaces";

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
        return { rawData: tasks.dump(), metadata, columns };
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
        await simulateBackend();
        const data = { ...parameters.data, ...parameters.taskId && { [this._primaryIdAttribute]: parameters.taskId } };
        const [record] = this.createTaskTrees([{ data }], parameters);
        return { record };
    }

    /** Creates the tasks with their subtrees from the rank `parameters` give, straight away. */
    public createTaskTrees(trees: ICreateTaskTree[], parameters: Omit<ITaskCreateParameters, 'data'>): IRawRecord[] {
        const parentReference = parameters.parentRecord ? [parameters.parentRecord.getNamedReference()] : null;
        return this._createTrees(trees, parentReference, parameters.stackRank);
    }

    public async deleteTasks(parameters: ITaskDeleteParameters): Promise<IDeleteTasksResult | null> {
        await simulateBackend();
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
        await simulateBackend();
        const subject = this._parameters.taskRuntime.getProvider().getFieldMapping().subject;
        const names = taskIds.map(taskId => this._parameters.tasks.getRow(taskId)?.[subject] ?? taskId).join(', ');
        await this._parameters.taskRuntime.services.get('pcfContext').navigation.openAlertDialog({ text: `Opening ${names}` });
        return null;
    }

    public async openRelatedRecord(reference: ComponentFramework.EntityReference): Promise<void> {
        await simulateBackend();
        await this._parameters.taskRuntime.services.get('pcfContext').navigation.openAlertDialog({ text: `Opening ${reference.name ?? reference.id.guid}` });
    }

    private get _primaryIdAttribute(): string {
        return this._parameters.metadata.PrimaryIdAttribute;
    }

    private _createTrees(trees: ICreateTaskTree[], parentReference: ComponentFramework.EntityReference[] | null, firstStackRank?: string): IRawRecord[] {
        const created: IRawRecord[] = [];
        let stackRank: string | undefined;
        for (const tree of trees) {
            stackRank = stackRank ? StackRank.between(stackRank, undefined) : firstStackRank ?? StackRank.between();
            const task = this._addTask(tree.data, parentReference, stackRank);
            created.push(task, ...this._createTrees(tree.children ?? [], [this._getReference(task)]));
        }
        return created;
    }

    private _addTask(data: IRawRecord | undefined, parentReference: ComponentFramework.EntityReference[] | null, stackRank: string): IRawRecord {
        const provider = this._parameters.taskRuntime.getProvider();
        const fieldMapping = provider.getFieldMapping();
        const task: IRawRecord = {};
        for (const column of provider.getColumns()) {
            task[column.name] = null;
        }
        Object.assign(task, structuredClone(data));
        task[this._primaryIdAttribute] ??= crypto.randomUUID();
        task[fieldMapping.parentId] = parentReference;
        task[fieldMapping.stackRank] = stackRank;
        task[fieldMapping.stateCode] ??= 0;
        this._parameters.tasks.insert([task]);
        return task;
    }

    private _getReference(task: IRawRecord): ComponentFramework.EntityReference {
        const subject = this._parameters.taskRuntime.getProvider().getFieldMapping().subject;
        return { id: { guid: task[this._primaryIdAttribute] }, name: task[subject], etn: this._parameters.metadata.LogicalName };
    }
}
