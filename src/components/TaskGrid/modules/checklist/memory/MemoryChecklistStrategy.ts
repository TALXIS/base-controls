import { IChecklistItem, IChecklistStrategy } from "../ChecklistProvider";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** Constructor parameters for {@link MemoryChecklistStrategy}. */
export interface IMemoryChecklistStrategyParams {
    /**
     * Where the rest of the grid is reached. Every strategy takes it, whether or not this one has a use
     * for it yet — one shape to remember, and nothing to change when it does.
     */
    services: ITaskGridServiceLocator;
    /**
     * The checklist items. Read only, and deep-cloned on the way in, so a fixture can be shared between
     * grids.
     */
    items: IChecklistItem[];
}

/**
 * In-memory {@link IChecklistStrategy} — the items come from the array it was given, with no Dataverse and
 * no network. Intended for local development, tests, Storybook and demos.
 */
export class MemoryChecklistStrategy implements IChecklistStrategy {
    private _items: IChecklistItem[];

    constructor(params: IMemoryChecklistStrategyParams) {
        this._items = structuredClone(params.items);
    }

    public async onGetChecklistItems(params: { taskIds: string[] }): Promise<IChecklistItem[]> {
        const taskIds = new Set(params.taskIds);
        return this._items.filter(item => taskIds.has(item.taskId));
    }
}
