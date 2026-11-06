import type { ITaskChecklistItem, ITaskChecklistStore } from "../TaskChecklist";
import { simulateBackend } from "../../../runtime/data-sources/memory/simulateBackend";

export class MemoryTaskChecklistStore implements ITaskChecklistStore {
    private _items: Record<string, ITaskChecklistItem[]>;

    constructor(items: Record<string, ITaskChecklistItem[]>) {
        this._items = structuredClone(items);
    }

    public async loadItems(taskIds: string[]): Promise<Map<string, ITaskChecklistItem[]>> {
        await simulateBackend();
        return new Map(taskIds.filter(taskId => this._items[taskId]).map(taskId => [taskId, structuredClone(this._items[taskId])]));
    }
}
