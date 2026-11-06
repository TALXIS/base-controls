import type { IChecklistItem, IChecklistParameters } from "../Checklist";
import { createChecklistModule, IChecklistModule } from "../createChecklistModule";
import { MemoryChecklistStore } from "./MemoryChecklistStore";

export interface IMemoryChecklistModuleParameters extends Omit<IChecklistParameters, 'onCreateStore'> {
    /** The items of each task, by task id. */
    items: Record<string, IChecklistItem[]>;
}

/** Checklists held in memory, starting over on every mount like the memory tasks. */
export const createMemoryChecklistModule = (parameters: IMemoryChecklistModuleParameters): IChecklistModule => {
    const { items, ...moduleParameters } = parameters;
    return createChecklistModule({ ...moduleParameters, onCreateStore: () => new MemoryChecklistStore(items) });
};
