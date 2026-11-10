import type { MemoryTable } from "@core/state";
import type { ITaskChecklistItem, ITaskChecklistParameters } from "../TaskChecklist";
import { createTaskChecklistModule, ITaskChecklistModule } from "../createTaskChecklistModule";
import { MemoryTaskChecklistStore } from "./MemoryTaskChecklistStore";

/** A checklist item with the task it belongs to; the row of the `items` table. */
export interface IMemoryTaskChecklistItem extends ITaskChecklistItem {
    taskId: string;
}

export interface IMemoryTaskChecklistModuleParameters extends Omit<ITaskChecklistParameters, 'createStore'> {
    /** Every task's items, in the order the table holds them. */
    items: MemoryTable<IMemoryTaskChecklistItem>;
}

/** Checklists kept in the `items` table you pass. */
export const createMemoryTaskChecklistModule = (parameters: IMemoryTaskChecklistModuleParameters): ITaskChecklistModule => {
    const { items, ...moduleParameters } = parameters;
    return createTaskChecklistModule({ ...moduleParameters, createStore: () => new MemoryTaskChecklistStore(items) });
};
