import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/**
 * Where a checklist item has got to. A named union rather than a flag, so the set can grow — `cancelled`,
 * `blocked` — without every consumer having to reinterpret a boolean.
 */
export type ChecklistItemStatus = 'active' | 'complete';

/**
 * One checklist item on a task, as the grid sees it.
 *
 * Only what the grid uses is here — a strategy reading a richer record (an owner, a due date, audit
 * fields) keeps the rest to itself.
 */
export interface IChecklistItem {
    id: string;
    /** The task this item belongs to. */
    taskId: string;
    name: string;
    status: ChecklistItemStatus;
    description?: string;
}

/** Lifecycle events for the checklist load. */
export interface IChecklistProviderEvents {
    /** @param taskIds The tasks about to be loaded. */
    onBeforeChecklistRefreshed: (taskIds: string[]) => void;
    /**
     * @param refreshedTaskIds The tasks that were just reloaded — the same ids `refresh` was called with.
     * A cell watches for its own task and repaints; there is nothing finer to report, because an item
     * belongs to one task, so a reload can only have changed the tasks it was asked about.
     */
    onAfterChecklistRefreshed: (refreshedTaskIds: string[]) => void;
}

/** Where checklist items are read from. */
export interface IChecklistStrategy {
    /**
     * @param taskIds The tasks the grid has loaded. An item belongs to exactly one task, so only items
     * whose `taskId` is one of these come back.
     */
    onGetChecklistItems: (params: { taskIds: string[] }) => Promise<IChecklistItem[]>;
}

/** Constructor parameters for {@link ChecklistProvider}. */
export interface IChecklistProviderParameters {
    /** Where the checklist items are read from. */
    strategy: IChecklistStrategy;
    /** Where the task side and the other modules are reached. Resolve in methods, never in a constructor. */
    services: ITaskGridServiceLocator;
}

/** The loaded checklist items, kept per task so a cell can ask about its own. */
export interface IChecklistProvider {
    /** Lifecycle events. */
    events: IEventEmitter<IChecklistProviderEvents>;
    /**
     * Loads the checklist items of the given tasks and stores them against each one. Awaited by the grid's
     * factory with the tasks it just loaded, before anything renders — which is what lets every getter
     * below be synchronous.
     *
     * Merges rather than replaces: a task the call did not name keeps the items it already has, so
     * refreshing a handful of tasks as they load is safe.
     */
    refresh: (taskIds: string[]) => Promise<void>;
    /**
     * Everything loaded so far, or — given a task — that task's items.
     * @param taskId Omit for the whole set.
     */
    getItems: (taskId?: string) => IChecklistItem[];
    /** One item by its own id, not a task's. */
    getItemById: (itemId: string) => IChecklistItem | undefined;
    /** Whether the task has any items at all. */
    hasItems: (taskId: string) => boolean;
}

/**
 * An {@link IChecklistStrategy} with what it loaded kept per task, so a cell can ask about its own task
 * without going back to the strategy.
 *
 * Built by `createChecklistModule`, never constructed directly by a consumer.
 */
export class ChecklistProvider implements IChecklistProvider {
    public events = new EventEmitter<IChecklistProviderEvents>();
    private _strategy: IChecklistStrategy;
    private _services: ITaskGridServiceLocator;
    //the whole state: an item belongs to one task, so the task is the key and nothing derived is kept
    private _itemsByTask: Map<string, IChecklistItem[]> = new Map();

    constructor(parameters: IChecklistProviderParameters) {
        this._strategy = parameters.strategy;
        this._services = parameters.services;
    }

    public async refresh(taskIds: string[]): Promise<void> {
        this.events.dispatchEvent('onBeforeChecklistRefreshed', taskIds);
        const items = await this._strategy.onGetChecklistItems({ taskIds });
        const loadedByTask: Map<string, IChecklistItem[]> = new Map();
        for (const item of items) {
            const taskItems = loadedByTask.get(item.taskId);
            taskItems ? taskItems.push(item) : loadedByTask.set(item.taskId, [item]);
        }
        //written per refreshed task, which is the whole of the merge: a task the call did not name keeps
        //what it had, and one whose items are all gone is set to none of them
        for (const taskId of taskIds) {
            this._itemsByTask.set(taskId, loadedByTask.get(taskId) ?? []);
        }
        this.events.dispatchEvent('onAfterChecklistRefreshed', taskIds);
    }

    public getItems(taskId?: string): IChecklistItem[] {
        if (taskId === undefined) {
            return [...this._itemsByTask.values()].flat();
        }
        return [...(this._itemsByTask.get(taskId) ?? [])];
    }

    public getItemById(itemId: string): IChecklistItem | undefined {
        return this.getItems().find(item => item.id === itemId);
    }

    public hasItems(taskId: string): boolean {
        //length, not the key: a refreshed task with nothing is stored as an empty list
        return this.getItems(taskId).length > 0;
    }
}
