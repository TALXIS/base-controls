import type { ITaskChecklistItem, ITaskChecklistParameters } from "../TaskChecklist";
import { createTaskChecklistModule, ITaskChecklistModule } from "../createTaskChecklistModule";
import { MemoryTaskChecklistStore } from "./MemoryTaskChecklistStore";

export interface IMemoryTaskChecklistModuleParameters extends Omit<ITaskChecklistParameters, 'createStore'> {
    /** The items of each task, by task id. */
    items: Record<string, ITaskChecklistItem[]>;
}

/** Checklists held in memory, starting over on every mount like the memory tasks. */
export const createMemoryTaskChecklistModule = (parameters: IMemoryTaskChecklistModuleParameters): ITaskChecklistModule => {
    const { items, ...moduleParameters } = parameters;
    return createTaskChecklistModule({ ...moduleParameters, createStore: () => new MemoryTaskChecklistStore(items) });
};
