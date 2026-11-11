import type { MemoryTable } from "@core/state";
import type { ITaskChecklistItem, ITaskChecklistStore } from "../TaskChecklist";
import type { IMemoryTaskChecklistItem } from "./createMemoryTaskChecklistModule";

export class MemoryTaskChecklistStore implements ITaskChecklistStore {
    private _items: MemoryTable<IMemoryTaskChecklistItem>;

    constructor(items: MemoryTable<IMemoryTaskChecklistItem>) {
        this._items = items;
    }

    public async loadItems(taskIds: string[]): Promise<Map<string, ITaskChecklistItem[]>> {
        const itemsByTask = new Map<string, ITaskChecklistItem[]>();
        const loadedTaskIds = new Set(taskIds);
        for (const { taskId, ...item } of this._items.getRows(row => loadedTaskIds.has(row.taskId))) {
            itemsByTask.set(taskId, [...itemsByTask.get(taskId) ?? [], item]);
        }
        return itemsByTask;
    }
}
