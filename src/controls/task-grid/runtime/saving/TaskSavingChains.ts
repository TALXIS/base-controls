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

/** The tasks a save can reach, held until the save and the sync after it settle. */
export interface ITaskSavingChains {
    readonly events: IEventSubscriber<ITaskSavingChainsEvents>;
    /** Whether the task is in a chain whose save has started, so a change to it would race the save. */
    isTaskLocked(taskId: string): boolean;
    /** Whether the task is in a chain whose save has run long enough to show. */
    isTaskSaving(taskId: string): boolean;
    readonly hooks: ITaskSavingChainsHooks;
    /** Runs a write other than a record save, holding the chain of the tasks it touches. */
    track<T>(taskIds: string[], operation: () => Promise<T>): Promise<T>;
}

interface IChainHold {
    taskIds: Set<string>;
    isShown: boolean;
    timer: number;
}

export class TaskSavingChains implements ITaskSavingChains {
    public readonly events = new EventEmitter<ITaskSavingChainsEvents>();
    private _provider?: ITaskDataProvider;
    public readonly hooks = {
        links: new HookRegistry<TaskSavingChainLinksHook>(),
    };
    //how many held chains each task is in
    private _lockedCounts = new Map<string, number>();
    //how many shown chains each task is in
    private _savingCounts = new Map<string, number>();
    //held until the record's saves and the sync after them settle
    private _savingHolds = new Map<string, IChainHold>();
    private _holds = new Set<IChainHold>();
    private _isDestroyed = false;

    /** Starts following the provider's saves; the returned function stops it. */
    public attach(provider: ITaskDataProvider): () => void {
        this._provider = provider;
        const offBeforeSaved = provider.addEventListener('onBeforeRecordSaved', this._onBeforeRecordSaved);
        const offAfterSaved = provider.addEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
        return () => { offBeforeSaved(); offAfterSaved(); };
    }

    public isTaskLocked(taskId: string): boolean {
        return this._lockedCounts.has(taskId);
    }

    public isTaskSaving(taskId: string): boolean {
        return this._savingCounts.has(taskId);
    }

    public async track<T>(taskIds: string[], operation: () => Promise<T>): Promise<T> {
        const hold = this._hold(taskIds);
        try {
            return await operation();
        }
        finally {
            this._release(hold);
        }
    }

    public destroy(): void {
        this._isDestroyed = true;
        this._holds.forEach(hold => window.clearTimeout(hold.timer));
    }

    private _onBeforeRecordSaved = (record: IRecord): void => {
        const taskId = record.getRecordId();
        if (!this._savingHolds.has(taskId)) {
            this._savingHolds.set(taskId, this._hold([taskId]));
        }
    };

    private _onAfterRecordSaved = async (result: IRecordSaveOperationResult): Promise<void> => {
        const taskId = result.recordId;
        const hold = this._savingHolds.get(taskId);
        if (!hold) {
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
        //overlapping saves report once, on the last
        if (this._savingHolds.get(taskId) !== hold || this._provider?.getRecordsMap()[taskId]?.isSaving()) {
            return;
        }
        this._savingHolds.delete(taskId);
        this._release(hold);
    };

    //locks the chain at once and shows it only once the save outlasts the delay
    private _hold(taskIds: string[]): IChainHold {
        const hold: IChainHold = { taskIds: this._getChain(taskIds), isShown: false, timer: 0 };
        hold.timer = window.setTimeout(() => {
            hold.isShown = true;
            this._count(this._savingCounts, hold.taskIds, 1);
            this.events.dispatchEvent('onChainsChanged', [...hold.taskIds]);
        }, SAVING_DELAY);
        this._holds.add(hold);
        this._count(this._lockedCounts, hold.taskIds, 1);
        this.events.dispatchEvent('onChainsChanged', [...hold.taskIds]);
        return hold;
    }

    private _release(hold: IChainHold): void {
        window.clearTimeout(hold.timer);
        this._holds.delete(hold);
        if (this._isDestroyed) {
            return;
        }
        this._count(this._lockedCounts, hold.taskIds, -1);
        if (hold.isShown) {
            this._count(this._savingCounts, hold.taskIds, -1);
        }
        this.events.dispatchEvent('onChainsChanged', [...hold.taskIds]);
    }

    private _count(counts: Map<string, number>, taskIds: Set<string>, change: number): void {
        taskIds.forEach(taskId => {
            const count = (counts.get(taskId) ?? 0) + change;
            if (count > 0) {
                counts.set(taskId, count);
            }
            else {
                counts.delete(taskId);
            }
        });
    }

    //a moved task takes its subtasks and successors along; a summary it stretches takes only its successors
    private _getChain(taskIds: string[]): Set<string> {
        const structure = this._provider?.getRecordTree().structure;
        const reached = new Set<string>();
        const moved = new Set<string>();
        const queue = taskIds.map(taskId => ({ taskId, isMoved: true }));
        while (queue.length > 0) {
            const { taskId, isMoved } = queue.pop()!;
            if (moved.has(taskId) || (!isMoved && reached.has(taskId))) {
                continue;
            }
            reached.add(taskId);
            if (isMoved) {
                moved.add(taskId);
                structure?.getDescendants(taskId).forEach(descendant => queue.push({ taskId: descendant.getRecordId(), isMoved: true }));
            }
            this._getLinkedTaskIds(taskId).forEach(linkedTaskId => queue.push({ taskId: linkedTaskId, isMoved: true }));
            structure?.getAncestorIds(taskId).forEach(ancestorId => queue.push({ taskId: ancestorId, isMoved: false }));
        }
        return reached;
    }

    private _getLinkedTaskIds(taskId: string): string[] {
        const result = { linkedTaskIds: [] as string[] };
        this.hooks.links.apply(result, { taskId });
        return result.linkedTaskIds;
    }
}
