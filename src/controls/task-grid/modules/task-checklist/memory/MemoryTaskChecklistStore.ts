import type { MemoryTable } from "@core/state";
import type { ITaskChecklistItem, ITaskChecklistStore } from "../TaskChecklist";
import type { IMemoryTaskChecklistItem } from "./createMemoryTaskChecklistModule";
import { simulateBackend } from "../../../runtime/data-sources/memory/simulateBackend";

export class MemoryTaskChecklistStore implements ITaskChecklistStore {
    private _items: MemoryTable<IMemoryTaskChecklistItem>;

    constructor(items: MemoryTable<IMemoryTaskChecklistItem>) {
        this._items = items;
    }

    public async loadItems(taskIds: string[]): Promise<Map<string, ITaskChecklistItem[]>> {
        await simulateBackend();
        const itemsByTask = new Map<string, ITaskChecklistItem[]>();
        const loadedTaskIds = new Set(taskIds);
        for (const { taskId, ...item } of this._items.getRows(row => loadedTaskIds.has(row.taskId))) {
            itemsByTask.set(taskId, [...itemsByTask.get(taskId) ?? [], item]);
        }
        return itemsByTask;
    }
}
