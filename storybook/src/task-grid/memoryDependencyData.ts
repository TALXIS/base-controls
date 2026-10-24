import type { IColumn, IRawRecord } from "@talxis/client-libraries";
import type { ITaskDependency } from "@talxis/base-controls";
import { PARENT_ID_COL, PRIMARY_ID, STACK_RANK_COL, TASKS } from "./memoryTaskData";

/** Under every other parent, each task waits on its previous sibling; every third link is start-to-start. */
export const createDependencies = (tasks: IRawRecord[]): ITaskDependency[] => {
    const siblings = new Map<string, IRawRecord[]>();
    for (const task of tasks) {
        const parentId = task[PARENT_ID_COL]?.[0]?.id?.guid ?? '';
        siblings.set(parentId, [...siblings.get(parentId) ?? [], task]);
    }
    const dependencies: ITaskDependency[] = [];
    [...siblings.values()].forEach((group, groupIndex) => {
        if (groupIndex % 2 === 1) {
            return;
        }
        const ordered = [...group].sort((a, b) => (a[STACK_RANK_COL] as string).localeCompare(b[STACK_RANK_COL] as string));
        for (let index = 1; index < ordered.length; index++) {
            const predecessorTaskId = ordered[index - 1][PRIMARY_ID] as string;
            const successorTaskId = ordered[index][PRIMARY_ID] as string;
            dependencies.push({ id: `dep-${predecessorTaskId}-${successorTaskId}`, predecessorTaskId, successorTaskId, type: dependencies.length % 3 === 2 ? 'startToStart' : 'finishToStart' });
        }
    });
    return dependencies;
};

/** The dependencies of the sample tasks. */
export const DEPENDENCIES = createDependencies(TASKS);

/** The dependency columns as a view lists them; the module fills in the rest. */
export const DEPENDENCY_COLUMNS: IColumn[] = [
    { name: 'predecessors__virtual', displayName: 'Predecessors', dataType: 'Lookup.Simple', order: 0, visualSizeFactor: 100 },
    { name: 'successors__virtual', displayName: 'Successors', dataType: 'Lookup.Simple', order: 0, visualSizeFactor: 100 },
];
