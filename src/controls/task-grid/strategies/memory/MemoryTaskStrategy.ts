import { IAvailableRelatedColumn, IColumn, IMemoryProviderEntityMetadata, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { StackRank } from "@utils/stack-rank";
import { IDeleteTasksResult, IFieldMapping, IOpenTasksResult, ITaskCreateParams, ITaskDeleteParams, ITaskLoadResult, ITaskMoveParams, ITaskStrategy } from "../../provider/interfaces";

export interface IMemoryTaskStrategyParameters {
    /** The tasks to start with; copied, so changes never reach this array. */
    records: IRawRecord[];
    /** `PrimaryIdAttribute` is required. */
    metadata: IMemoryProviderEntityMetadata;
    /** Every column a view or Edit columns may use. */
    columns: IColumn[];
    /** Values a new task starts with, under what the caller asks for. */
    onGetNewTaskDefaults?: (parentId?: string) => Partial<IRawRecord>;
    /** Opens records, which memory data has no forms for. */
    onOpenRecords?: (references: ComponentFramework.EntityReference[], isTask: boolean) => Promise<IOpenTasksResult | null>;
}

/** Tasks held in memory; what the user changes stays for every view this strategy loads. */
export class MemoryTaskStrategy implements ITaskStrategy {
    private _parameters: IMemoryTaskStrategyParameters;
    private _store: IRawRecord[];

    constructor(parameters: IMemoryTaskStrategyParameters) {
        this._parameters = parameters;
        this._store = structuredClone(parameters.records);
    }

    /** The tasks as they are now. */
    public getRecords(): IRawRecord[] {
        return this._store;
    }

    public async onLoad(): Promise<ITaskLoadResult> {
        return { rawData: structuredClone(this._store), metadata: this._parameters.metadata, columns: this._parameters.columns };
    }

    public async onGetAvailableColumns(): Promise<IColumn[]> {
        return this._parameters.columns.map(column => ({ ...column, isHidden: false }));
    }

    public async onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return [];
    }

    public async onCreateTask(params: ITaskCreateParams): Promise<IRawRecord | null> {
        const { fieldMapping, metadata } = params;
        const parentId = params.parentRecord?.getRecordId();
        const task: IRawRecord = {};
        for (const column of params.columns) {
            task[column.name] = null;
        }
        Object.assign(task, this._parameters.onGetNewTaskDefaults?.(parentId), params.data);
        task[metadata.PrimaryIdAttribute!] = crypto.randomUUID();
        task[fieldMapping.parentId] = this._getParentReference(params.parentRecord);
        task[fieldMapping.stackRank] = this._getStackRank(params.previousSibling, params.nextSibling, fieldMapping);
        task[fieldMapping.stateCode] ??= 0;
        this._store.push(task);
        return structuredClone(task);
    }

    public async onDeleteTasks(params: ITaskDeleteParams): Promise<IDeleteTasksResult | null> {
        const deletedTaskIds = new Set<string>();
        for (const taskId of params.taskIds) {
            deletedTaskIds.add(taskId);
            params.tree.structure.getDescendants(taskId).forEach(record => deletedTaskIds.add(record.getRecordId()));
        }
        const primaryIdAttribute = this._parameters.metadata.PrimaryIdAttribute!;
        this._store = this._store.filter(task => !deletedTaskIds.has(task[primaryIdAttribute]));
        return { success: true, deletedTaskIds: [...deletedTaskIds] };
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
        return this._parameters.onOpenRecords?.(references, isTask) ?? null;
    }

    private _write(taskId: string, values: IRawRecord): void {
        const primaryIdAttribute = this._parameters.metadata.PrimaryIdAttribute!;
        const task = this._store.find(task => task[primaryIdAttribute] === taskId);
        if (task) {
            Object.assign(task, structuredClone(values));
        }
    }

    private _getParentReference(parent?: IRecord): ComponentFramework.EntityReference[] | null {
        return parent ? [parent.getNamedReference()] : null;
    }

    private _getStackRank(previousSibling: IRecord | undefined, nextSibling: IRecord | undefined, fieldMapping: IFieldMapping): string {
        return StackRank.between(previousSibling?.getValue(fieldMapping.stackRank), nextSibling?.getValue(fieldMapping.stackRank));
    }
}
