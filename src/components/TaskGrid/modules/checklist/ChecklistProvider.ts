import { DataTypes, EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import { applyColumn } from "@components/TaskGrid/providers/saved-query";

/** Name of the virtual column showing a task's checklist. Only exists with this module. */
export const CHECKLIST_COLUMN_NAME = 'checklist__virtual';

/**
 * One checklist item on a task, as the grid sees it.
 *
 * Which task it belongs to is not on the item — the strategy returns items already grouped by task, and the
 * provider keys its state the same way. Only what the grid uses is here; a strategy reading a richer record
 * (an owner, a due date, audit fields) keeps the rest to itself.
 */
export interface IChecklistItem {
    id: string;
    name: string;
    /** Whether the item has been ticked off. */
    isCompleted: boolean;
}

/** Lifecycle events for the checklist load. */
export interface IChecklistProviderEvents {
    /** @param taskIds The tasks about to be loaded. */
    onBeforeChecklistRefreshed: (taskIds: string[]) => void;
    /**
     * @param refreshedTaskIds The tasks that were just reloaded — the same ids `refresh` was called with.
     * A cell watches for its own task and repaints; there is nothing finer to report, because a reload can
     * only have changed the tasks it was asked about.
     */
    onAfterChecklistRefreshed: (refreshedTaskIds: string[]) => void;
}

/** Where checklist items are read from. */
export interface IChecklistStrategy {
    /**
     * @param taskIds The tasks the grid has loaded.
     * @returns The items of each task, keyed by task id. A task with no items may be omitted or given an
     * empty array; a task not in `taskIds` is ignored.
     */
    onGetChecklistItems: (params: { taskIds: string[] }) => Promise<Record<string, IChecklistItem[]>>;
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
     * Loads the checklist items of the given tasks and stores them against each one. Awaited before anything renders,
     * which is what lets every getter below be synchronous.
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
        this._registerColumns();
        this._registerCleanup();
    }

    /**
     * Puts this module's column on every view, hidden.
     *
     * Its cell reads this provider rather than a value on the task, so there is nothing to write, sort or
     * filter by. Described on every refresh, so a view that stored only the name gets the rest back.
     */
    private _registerColumns(): void {
        this._services.whenAvailable('savedQueryDataProvider', provider => {
            provider.registerHook(query => applyColumn(query, {
                name: CHECKLIST_COLUMN_NAME,
                dataType: DataTypes.SingleLineText,
                displayName: this._services.get('localizationService').getLocalizedString('checklist'),
                isVirtual: true,
                visualSizeFactor: 200,
                isHidden: true,
                disableSorting: true,
                metadata: { IsValidForUpdate: false, SupportedFilterConditionOperators: [] },
            }));
        });
    }

    public async refresh(taskIds: string[]): Promise<void> {
        this.events.dispatchEvent('onBeforeChecklistRefreshed', taskIds);
        const itemsByTask = await this._strategy.onGetChecklistItems({ taskIds });
        //written per refreshed task, which is the whole of the merge: a task the call did not name keeps
        //what it had, and one whose items are all gone is set to none of them
        for (const taskId of taskIds) {
            this._itemsByTask.set(taskId, itemsByTask[taskId] ?? []);
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

    /**
     * Releases the provider's listeners when the control it belongs to goes away. Waited for rather than
     * resolved: the module is built before the control exists.
     */
    private _registerCleanup(): void {
        this._services.whenAvailable('datasetControl', datasetControl => {
            datasetControl.events.addEventListener('onBeforeDestroy', () => this.events.clearEventListeners());
        });
    }
}
