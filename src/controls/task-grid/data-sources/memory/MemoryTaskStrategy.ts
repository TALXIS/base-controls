import { IAvailableColumnOptions, IAvailableRelatedColumn, IColumn, IMemoryProviderEntityMetadata, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { StackRank } from "@utils/stack-rank";
import { IDeleteTasksResult, IFieldMapping, IOpenTasksResult, ITaskCreateParams, ITaskDeleteParams, ITaskLoadResult, ITaskMoveParams, ITaskStrategy } from "../../provider/interfaces";
import type { ITaskDatasetControlRuntime } from "../../runtime";
import type { MemoryTaskForm } from "./MemoryTaskForm";

export interface IMemoryTaskStrategyParameters {
    /** The tasks to start with; copied, so changes never reach this array. */
    records: IRawRecord[];
    /** `PrimaryIdAttribute` is required. */
    metadata: IMemoryProviderEntityMetadata;
    /** Every column a view or Edit columns may use. */
    columns: IColumn[];
}

/** A strategy over tasks held in memory, handed its mount by `createMemoryTaskDataSource`. */
export interface IMemoryTaskStrategy extends ITaskStrategy {
    onInitialize(taskDatasetControl: ITaskDatasetControlRuntime): void;
}

/** Tasks held in memory, opened in the memory form. */
export class MemoryTaskStrategy implements IMemoryTaskStrategy {
    protected _parameters: IMemoryTaskStrategyParameters;
    protected _store: IRawRecord[];
    protected _taskDatasetControl!: ITaskDatasetControlRuntime;

    constructor(parameters: IMemoryTaskStrategyParameters) {
        this._parameters = parameters;
        this._store = structuredClone(parameters.records);
    }

    public onInitialize(taskDatasetControl: ITaskDatasetControlRuntime): void {
        this._taskDatasetControl = taskDatasetControl;
    }

    public async onLoad(): Promise<ITaskLoadResult> {
        return { rawData: structuredClone(this._store), metadata: this._parameters.metadata, columns: this._parameters.columns };
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

    public async onCreateTask(params: ITaskCreateParams): Promise<IRawRecord | null> {
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
        this._store.push(task);
        return structuredClone(task);
    }

    public async onDeleteTasks(params: ITaskDeleteParams): Promise<IDeleteTasksResult | null> {
        const deletedTaskIds = new Set(params.taskIds);
        const primaryIdAttribute = this._parameters.metadata.PrimaryIdAttribute!;
        this._store = this._store.filter(task => !deletedTaskIds.has(task[primaryIdAttribute]));
        return { success: true, deletedTaskIds: params.taskIds };
    }

    public async onMoveTask(params: ITaskMoveParams): Promise<IRawRecord[] | null> {
        const { fieldMapping } = params;
        const moved = {
            ...params.movingRecord.getRawData(),
            [fieldMapping.parentId]: this._getParentReference(params.parentRecord),
            [fieldMapping.stackRank]: this._getStackRank(params.previousSibling, params.nextSibling, fieldMapping),
        };
        this._write(params.movingRecord.getRecordId(), { [fieldMapping.parentId]: moved[fieldMapping.parentId], [fieldMapping.stackRank]: moved[fieldMapping.stackRank] });
        return [moved];
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

    public async onOpenRecords(references: ComponentFramework.EntityReference[], isTask: boolean): Promise<IOpenTasksResult | null> {
        if (!isTask) {
            return null;
        }
        const updatedRecords: IRawRecord[] = [];
        for (const reference of references) {
            const task = this._find(reference.id.guid);
            const saved = task && await this._getForm().open(structuredClone(task), { isReadOnly: this._isTaskLocked(reference.id.guid) });
            if (saved) {
                Object.assign(task, saved);
                updatedRecords.push(structuredClone(saved));
            }
        }
        return updatedRecords.length > 0 ? { success: true, updatedRecords } : null;
    }

    protected _find(taskId: string): IRawRecord | undefined {
        return this._store.find(task => task[this._parameters.metadata.PrimaryIdAttribute!] === taskId);
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

    protected _isTaskLocked(taskId: string): boolean {
        const isEditingEnabled = this._taskDatasetControl.isEditingEnabled();
        return !isEditingEnabled || !this._taskDatasetControl.getProvider().isRecordActive(taskId);
    }

    protected _getForm(): MemoryTaskForm {
        return this._taskDatasetControl.services.get('memoryTaskForm');
    }
}
