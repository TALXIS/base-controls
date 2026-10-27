import { IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";
import { StackRank } from "@utils/stack-rank";
import type { ICreateTaskTree, ITaskCreateParams } from "../../provider";

export interface IMemoryTaskDatabaseParameters {
    /** The tasks to start with; copied, so changes never reach this array. */
    records: IRawRecord[];
    /** `PrimaryIdAttribute` is required. */
    metadata: IMemoryProviderEntityMetadata;
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

    /** Creates the tasks with their subtrees where `params` place the first. */
    public createTasks(trees: ICreateTaskTree[], params: ITaskCreateParams): IRawRecord[] {
        const { stackRank } = params.fieldMapping;
        const parentReference = params.parentRecord ? [params.parentRecord.getNamedReference()] : null;
        return this._createTrees(trees, params, parentReference, params.previousSibling?.getValue(stackRank), params.nextSibling?.getValue(stackRank));
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

    private _createTrees(trees: ICreateTaskTree[], params: ITaskCreateParams, parentReference: ComponentFramework.EntityReference[] | null, previousStackRank?: string, nextStackRank?: string): IRawRecord[] {
        const created: IRawRecord[] = [];
        let stackRank = previousStackRank;
        for (const tree of trees) {
            stackRank = StackRank.between(stackRank, nextStackRank);
            const task = this._addTask(params, tree.data, parentReference, stackRank);
            created.push(structuredClone(task), ...this._createTrees(tree.children ?? [], params, [this._getReference(task, params)]));
        }
        return created;
    }

    private _addTask(params: ITaskCreateParams, data: IRawRecord | undefined, parentReference: ComponentFramework.EntityReference[] | null, stackRank: string): IRawRecord {
        const { fieldMapping } = params;
        const task: IRawRecord = {};
        for (const column of params.columns) {
            task[column.name] = null;
        }
        Object.assign(task, structuredClone(data));
        task[this._metadata.PrimaryIdAttribute!] = crypto.randomUUID();
        task[fieldMapping.parentId] = parentReference;
        task[fieldMapping.stackRank] = stackRank;
        task[fieldMapping.stateCode] ??= 0;
        this._tasks.push(task);
        return task;
    }

    private _getReference(task: IRawRecord, params: ITaskCreateParams): ComponentFramework.EntityReference {
        return { id: { guid: task[this._metadata.PrimaryIdAttribute!] }, name: task[params.fieldMapping.subject], etn: this._metadata.LogicalName };
    }
}
