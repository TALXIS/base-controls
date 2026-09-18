import { IChecklistItem, IChecklistStrategy } from "../ChecklistProvider";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";

export interface IMemoryChecklistStrategyParams {
    /**
     * Where the rest of the grid is reached. Every strategy takes it, whether or not this one has a use
     * for it yet — one shape to remember, and nothing to change when it does.
     */
    services: ITaskGridServiceLocator;
    /**
     * The checklist items of each task, keyed by task id — the same shape the strategy hands back. Read
     * only, and deep-cloned on the way in, so a fixture can be shared between grids.
     */
    items: Record<string, IChecklistItem[]>;
}

/**
 * In-memory {@link IChecklistStrategy} — the items come from the map it was given, with no Dataverse and
 * no network. Intended for local development, tests, Storybook and demos.
 */
export class MemoryChecklistStrategy implements IChecklistStrategy {
    private _items: Record<string, IChecklistItem[]>;

    constructor(params: IMemoryChecklistStrategyParams) {
        this._items = structuredClone(params.items);
    }

    public async onGetChecklistItems(params: { taskIds: string[] }): Promise<Record<string, IChecklistItem[]>> {
        return Object.fromEntries(params.taskIds.map(taskId => [taskId, this._items[taskId] ?? []]));
    }
}
