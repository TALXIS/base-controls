import { EventEmitter, IEventEmitter, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import type { ITaskDataProvider } from "../../provider";

//a save quicker than this is not worth a flicker
const SAVING_DELAY = 300;

export interface ITaskSavingChainsEvents {
    /** Tasks joined or left the chains being saved. */
    onChainsChanged: (taskIds: string[]) => void;
}

export interface ITaskSavingChainLinksParameters {
    taskId: string;
}

/** Adds the tasks a change to one task moves, such as its successors. */
export type TaskSavingChainLinksHook = (result: { linkedTaskIds: string[] }, parameters: ITaskSavingChainLinksParameters) => void;

/** The tasks a save can reach, held as saving until the save and the sync after it settle. */
export interface ITaskSavingChains {
    readonly events: IEventEmitter<ITaskSavingChainsEvents>;
    /** Whether the task is in a chain being saved, once its save has run long enough to show it. */
    isTaskSaving(taskId: string): boolean;
    /**
     * Registers a hook over the tasks a change to one task moves; each is followed in turn, with its parents.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerLinks(hook: TaskSavingChainLinksHook, priority?: number): () => void;
    /** Runs a write that is not a record save, holding the chain of the tasks it touches until it settles. */
    track<T>(taskIds: string[], operation: () => Promise<T>): Promise<T>;
}

export class TaskSavingChains implements ITaskSavingChains {
    public readonly events = new EventEmitter<ITaskSavingChainsEvents>();
    private _provider?: ITaskDataProvider;
    private _linksHooks = new HookRegistry<TaskSavingChainLinksHook>();
    //how many chains being shown each task is in
    private _counts = new Map<string, number>();
    private _saveTimers = new Map<string, number>();
    private _saveChains = new Map<string, Set<string>>();
    private _isDestroyed = false;

    /** Starts following the provider's saves. */
    public attach(provider: ITaskDataProvider): void {
        this._provider = provider;
        provider.addEventListener('onBeforeRecordSaved', this._onBeforeRecordSaved);
        provider.addEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
    }

    public isTaskSaving(taskId: string): boolean {
        return (this._counts.get(taskId) ?? 0) > 0;
    }

    public registerLinks(hook: TaskSavingChainLinksHook, priority?: number): () => void {
        return this._linksHooks.register(hook, priority);
    }

    public async track<T>(taskIds: string[], operation: () => Promise<T>): Promise<T> {
        let chain: Set<string> | undefined;
        const timer = window.setTimeout(() => chain = this._hold(taskIds), SAVING_DELAY);
        try {
            return await operation();
        }
        finally {
            window.clearTimeout(timer);
            if (chain) {
                this._release(chain);
            }
        }
    }

    public destroy(): void {
        this._isDestroyed = true;
        this._saveTimers.forEach(timer => window.clearTimeout(timer));
        this._provider?.removeEventListener('onBeforeRecordSaved', this._onBeforeRecordSaved);
        this._provider?.removeEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
        this.events.clearEventListeners();
    }

    private _onBeforeRecordSaved = (record: IRecord): void => {
        const taskId = record.getRecordId();
        window.clearTimeout(this._saveTimers.get(taskId));
        this._saveTimers.set(taskId, window.setTimeout(() => {
            this._saveTimers.delete(taskId);
            if (!this._saveChains.has(taskId)) {
                this._saveChains.set(taskId, this._hold([taskId]));
            }
        }, SAVING_DELAY));
    };

    private _onAfterRecordSaved = async (result: IRecordSaveOperationResult): Promise<void> => {
        const taskId = result.recordId;
        window.clearTimeout(this._saveTimers.get(taskId));
        this._saveTimers.delete(taskId);
        const chain = this._saveChains.get(taskId);
        if (!chain) {
            return;
        }
        //the rescheduled dates arrive with the sync the save starts, which this joins
        if (result.success) {
            try {
                await this._provider?.synchronize();
            }
            catch {
                //the provider reports a failed sync where it runs it
            }
        }
        this._saveChains.delete(taskId);
        this._release(chain);
    };

    private _hold(taskIds: string[]): Set<string> {
        const chain = this._getChain(taskIds);
        chain.forEach(taskId => this._counts.set(taskId, (this._counts.get(taskId) ?? 0) + 1));
        this.events.dispatchEvent('onChainsChanged', [...chain]);
        return chain;
    }

    private _release(chain: Set<string>): void {
        if (this._isDestroyed) {
            return;
        }
        chain.forEach(taskId => {
            const count = (this._counts.get(taskId) ?? 1) - 1;
            if (count > 0) {
                this._counts.set(taskId, count);
            }
            else {
                this._counts.delete(taskId);
            }
        });
        this.events.dispatchEvent('onChainsChanged', [...chain]);
    }

    //what a save can move: the tasks and their subtasks, what their links reach, and the parents of all of it
    private _getChain(taskIds: string[]): Set<string> {
        const structure = this._provider?.getRecordTree().structure;
        const reached = new Set<string>();
        const queue = [...taskIds];
        while (queue.length > 0) {
            const taskId = queue.pop()!;
            if (!reached.has(taskId)) {
                reached.add(taskId);
                queue.push(...this._getLinkedTaskIds(taskId));
            }
        }
        const chain = new Set(reached);
        taskIds.forEach(taskId => structure?.getDescendants(taskId).forEach(descendant => chain.add(descendant.getRecordId())));
        reached.forEach(taskId => structure?.getAncestorIds(taskId).forEach(ancestorId => chain.add(ancestorId)));
        return chain;
    }

    private _getLinkedTaskIds(taskId: string): string[] {
        const result = { linkedTaskIds: [] as string[] };
        this._linksHooks.apply(result, { taskId });
        return result.linkedTaskIds;
    }
}
