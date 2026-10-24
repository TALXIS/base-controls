import type { IChecklistItem, IChecklistParameters, IChecklistStore } from "../Checklist";
import { createChecklistModule, IChecklistModule } from "../createChecklistModule";
import { simulateDelay } from "../../../data-sources/memory/simulateBackend";

export interface IMemoryChecklistModuleParameters extends Omit<IChecklistParameters, 'onCreateStore'> {
    /** The items of each task, by task id. */
    items: Record<string, IChecklistItem[]>;
}

class MemoryChecklistStore implements IChecklistStore {
    private _items: Record<string, IChecklistItem[]>;

    constructor(items: Record<string, IChecklistItem[]>) {
        this._items = structuredClone(items);
    }

    public async onLoadItems(taskIds: string[]): Promise<Map<string, IChecklistItem[]>> {
        await simulateDelay();
        return new Map(taskIds.filter(taskId => this._items[taskId]).map(taskId => [taskId, structuredClone(this._items[taskId])]));
    }
}

/** Checklists held in memory, starting over on every mount like the memory tasks. */
export const createMemoryChecklistModule = (parameters: IMemoryChecklistModuleParameters): IChecklistModule => {
    const { items, ...moduleParameters } = parameters;
    return createChecklistModule({ ...moduleParameters, onCreateStore: () => new MemoryChecklistStore(items) });
};
