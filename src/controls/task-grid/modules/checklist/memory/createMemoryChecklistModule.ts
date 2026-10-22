import type { IChecklistItem, IChecklistParameters } from "../Checklist";
import { createChecklistModule, IChecklistModule } from "../createChecklistModule";

export interface IMemoryChecklistModuleParameters extends Omit<IChecklistParameters, 'onGetItems'> {
    /** The items of each task, by task id. */
    items: Record<string, IChecklistItem[]>;
}

/** Checklists held in memory. */
export const createMemoryChecklistModule = (parameters: IMemoryChecklistModuleParameters): IChecklistModule => {
    const { items, ...moduleParameters } = parameters;
    const itemsByTask = structuredClone(items);
    return createChecklistModule({ ...moduleParameters, onGetItems: task => itemsByTask[task.getRecordId()] ?? [] });
};
