import type { IChecklistItem, IChecklistStore } from "../Checklist";
import { simulateBackend } from "../../../data-sources/memory/simulateBackend";

export class MemoryChecklistStore implements IChecklistStore {
    private _items: Record<string, IChecklistItem[]>;

    constructor(items: Record<string, IChecklistItem[]>) {
        this._items = structuredClone(items);
    }

    public async onLoadItems(taskIds: string[]): Promise<Map<string, IChecklistItem[]>> {
        await simulateBackend();
        return new Map(taskIds.filter(taskId => this._items[taskId]).map(taskId => [taskId, structuredClone(this._items[taskId])]));
    }
}
