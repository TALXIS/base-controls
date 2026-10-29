import { IColumn, IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";
import { StackRank } from "@utils/stack-rank";
import type { ICreateTaskTree, IFieldMapping, ITaskCreateParams } from "../../provider";

export interface IMemoryTaskDatabaseParameters {
    /** The tasks to start with; copied, so changes never reach this array. */
    records: IRawRecord[];
    /** `PrimaryIdAttribute` is required. */
    metadata: IMemoryProviderEntityMetadata;
}

/** What the grid's tasks look like: the columns a new task starts with, and where it keeps its place. */
export interface IMemoryTaskShape {
    fieldMapping: IFieldMapping;
    columns: IColumn[];
}

/** Tasks held in memory, shared by the memory stores that read and write them. */
export class MemoryTaskDatabase {
    private _metadata: IMemoryProviderEntityMetadata;
    private _tasks: IRawRecord[];

    constructor(parameters: IMemoryTaskDatabaseParameters) {
        this._metadata = parameters.metadata;
        this._tasks = structuredClone(parameters.records);
    }

    public getMetadata(): IMemoryProviderEntityMetadata {
        return this._metadata;
    }

    public getTasks(): IRawRecord[] {
        return structuredClone(this._tasks);
    }

    public getTask(taskId: string): IRawRecord | undefined {
        const task = this._find(taskId);
        return task && structuredClone(task);
    }

    /** Creates the tasks with their subtrees, the first at the rank `params` give and the rest after it. */
    public createTasks(trees: ICreateTaskTree[], params: Omit<ITaskCreateParams, 'data'>, shape: IMemoryTaskShape): IRawRecord[] {
        const parentReference = params.parentRecord ? [params.parentRecord.getNamedReference()] : null;
        return this._createTrees(trees, shape, parentReference, params.stackRank);
    }

    public updateTask(taskId: string, values: IRawRecord): void {
        const task = this._find(taskId);
        if (task) {
            Object.assign(task, structuredClone(values));
        }
    }

    public deleteTasks(taskIds: string[]): void {
        const deletedTaskIds = new Set(taskIds);
        this._tasks = this._tasks.filter(task => !deletedTaskIds.has(task[this._metadata.PrimaryIdAttribute!]));
    }

    private _find(taskId: string): IRawRecord | undefined {
        return this._tasks.find(task => task[this._metadata.PrimaryIdAttribute!] === taskId);
    }

    private _createTrees(trees: ICreateTaskTree[], shape: IMemoryTaskShape, parentReference: ComponentFramework.EntityReference[] | null, firstStackRank?: string): IRawRecord[] {
        const created: IRawRecord[] = [];
        let stackRank: string | undefined;
        for (const tree of trees) {
            stackRank = stackRank ? StackRank.between(stackRank, undefined) : firstStackRank ?? StackRank.between();
            const task = this._addTask(shape, tree.data, parentReference, stackRank);
            created.push(structuredClone(task), ...this._createTrees(tree.children ?? [], shape, [this._getReference(task, shape)]));
        }
        return created;
    }

    private _addTask(shape: IMemoryTaskShape, data: IRawRecord | undefined, parentReference: ComponentFramework.EntityReference[] | null, stackRank: string): IRawRecord {
        const { fieldMapping } = shape;
        const task: IRawRecord = {};
        for (const column of shape.columns) {
            task[column.name] = null;
        }
        Object.assign(task, structuredClone(data));
        task[this._metadata.PrimaryIdAttribute!] ??= crypto.randomUUID();
        task[fieldMapping.parentId] = parentReference;
        task[fieldMapping.stackRank] = stackRank;
        task[fieldMapping.stateCode] ??= 0;
        this._tasks.push(task);
        return task;
    }

    private _getReference(task: IRawRecord, shape: IMemoryTaskShape): ComponentFramework.EntityReference {
        return { id: { guid: task[this._metadata.PrimaryIdAttribute!] }, name: task[shape.fieldMapping.subject], etn: this._metadata.LogicalName };
    }
}
