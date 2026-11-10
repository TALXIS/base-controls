import type { IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";
import type { MemoryTable } from "@core/state";
import { StackRank } from "@core/stack-rank";
import type { ITaskRuntime } from "../..";
import type { ICreateTaskTree, ITaskCreateParameters } from "../../provider/interfaces";

/** Creates the tasks with their subtrees in `tasks`, the first at the rank `parameters` give. */
export const createMemoryTaskTrees = (tasks: MemoryTable<IRawRecord>, taskRuntime: ITaskRuntime, trees: ICreateTaskTree[], parameters: Omit<ITaskCreateParameters, 'data'>): IRawRecord[] => {
    const provider = taskRuntime.getProvider();
    const fieldMapping = provider.getFieldMapping();
    const { PrimaryIdAttribute, LogicalName }: IMemoryProviderEntityMetadata = provider.getMetadata();

    const addTask = (data: IRawRecord | undefined, parentReference: ComponentFramework.EntityReference[] | null, stackRank: string): IRawRecord => {
        const task: IRawRecord = {};
        for (const column of provider.getColumns()) {
            task[column.name] = null;
        }
        Object.assign(task, structuredClone(data));
        task[PrimaryIdAttribute] ??= crypto.randomUUID();
        task[fieldMapping.parentId] = parentReference;
        task[fieldMapping.stackRank] = stackRank;
        task[fieldMapping.stateCode] ??= 0;
        tasks.insert([task]);
        return task;
    };

    const createTrees = (trees: ICreateTaskTree[], parentReference: ComponentFramework.EntityReference[] | null, firstStackRank?: string): IRawRecord[] => {
        const created: IRawRecord[] = [];
        let stackRank: string | undefined;
        for (const tree of trees) {
            stackRank = stackRank ? StackRank.between(stackRank, undefined) : firstStackRank ?? StackRank.between();
            const task = addTask(tree.data, parentReference, stackRank);
            const reference = { id: { guid: task[PrimaryIdAttribute] }, name: task[fieldMapping.subject], etn: LogicalName };
            created.push(task, ...createTrees(tree.children ?? [], [reference]));
        }
        return created;
    };

    const parentReference = parameters.parentRecord ? [parameters.parentRecord.getNamedReference()] : null;
    return createTrees(trees, parentReference, parameters.stackRank);
};
