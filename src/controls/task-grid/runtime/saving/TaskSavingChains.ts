import { EventEmitter, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { HookRegistry, IEventSubscriber, IHookPoint } from "@core";
import type { ITaskDataProvider } from "../provider";

//a save quicker than this is not worth a flicker
const SAVING_DELAY = 300;

export interface ITaskSavingChainsEvents {
    /** Tasks joined or left the chains being saved. */
    onChainsChanged: (taskIds: string[]) => void;
}

export interface ITaskSavingChainLinksHookParameters {
    taskId: string;
}

/** Adds the tasks a change to one task moves, such as its successors. */
export type TaskSavingChainLinksHook = (result: { linkedTaskIds: string[] }, parameters: ITaskSavingChainLinksHookParameters) => void;

export interface ITaskSavingChainsHooks {
    /** The tasks a change to one task moves. */
    readonly links: IHookPoint<TaskSavingChainLinksHook>;
}

/** The tasks a save can reach, held as saving until the save and the sync after it settle. */
export interface ITaskSavingChains {
    readonly events: IEventSubscriber<ITaskSavingChainsEvents>;
    /** Whether the task is in a chain whose save has run long enough to show. */
    isTaskSaving(taskId: string): boolean;
    readonly hooks: ITaskSavingChainsHooks;
    /** Runs a write other than a record save, holding the chain of the tasks it touches. */
    track<T>(taskIds: string[], operation: () => Promise<T>): Promise<T>;
}

interface ITaskSaves {
    count: number;
    timer?: number;
    chain?: Set<string>;
}

export class TaskSavingChains implements ITaskSavingChains {
    public readonly events = new EventEmitter<ITaskSavingChainsEvents>();
    private _provider?: ITaskDataProvider;
    public readonly hooks = {
        links: new HookRegistry<TaskSavingChainLinksHook>(),
    };
    //how many chains being shown each task is in
    private _counts = new Map<string, number>();
    //counted until each save and the sync after it settle
    private _saves = new Map<string, ITaskSaves>();
    private _isDestroyed = false;

    /** Starts following the provider's saves; the returned function stops it. */
    public attach(provider: ITaskDataProvider): () => void {
        this._provider = provider;
        const offBeforeSaved = provider.addEventListener('onBeforeRecordSaved', this._onBeforeRecordSaved);
        const offAfterSaved = provider.addEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
        return () => { offBeforeSaved(); offAfterSaved(); };
    }

    public isTaskSaving(taskId: string): boolean {
        return (this._counts.get(taskId) ?? 0) > 0;
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
        this._saves.forEach(saves => window.clearTimeout(saves.timer));
    }

    private _onBeforeRecordSaved = (record: IRecord): void => {
        const taskId = record.getRecordId();
        const saves = this._saves.get(taskId) ?? { count: 0 };
        saves.count++;
        if (!saves.chain && saves.timer === undefined) {
            saves.timer = window.setTimeout(() => {
                saves.timer = undefined;
                saves.chain = this._hold([taskId]);
            }, SAVING_DELAY);
        }
        this._saves.set(taskId, saves);
    };

    private _onAfterRecordSaved = async (result: IRecordSaveOperationResult): Promise<void> => {
        const taskId = result.recordId;
        const saves = this._saves.get(taskId);
        if (!saves) {
            return;
        }
        //joins the sync the save starts to get the rescheduled dates
        if (result.success) {
            try {
                await this._provider?.synchronize();
            }
            catch {
                //the provider reports a failed sync where it runs it
            }
        }
        saves.count--;
        if (saves.count > 0) {
            return;
        }
        window.clearTimeout(saves.timer);
        this._saves.delete(taskId);
        if (saves.chain) {
            this._release(saves.chain);
        }
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

    //the tasks, their subtasks, what their links reach and the parents of all of it
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
        this.hooks.links.apply(result, { taskId });
        return result.linkedTaskIds;
    }
}
