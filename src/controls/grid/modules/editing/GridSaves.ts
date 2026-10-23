import { EventEmitter, IEventEmitter, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { ErrorHelper, HookRegistry, IEventSubscriber } from "@utils";
import { IGridServiceLocator } from "../../services";

export interface IGridSavesEvents {
    onSaveStarted: (recordId: string) => void;
    onSaveFinished: (result: IRecordSaveOperationResult) => void;
}

/** One part of a record's save; a rejection counts as a failed part. */
export type GridSaveHandler = () => Promise<IRecordSaveOperationResult>;

/** A hook over a record's save, adding the handlers for what it keeps outside the record. */
export type GridSaveHook = (handlers: GridSaveHandler[], params: { record: IRecord }) => void;

export interface IGridSavesParameters {
    services: IGridServiceLocator;
}

/** Saves the grid's records, and whether each is saving. */
export interface IGridSaves {
    readonly events: IEventSubscriber<IGridSavesEvents>;
    isSaving(record: IRecord): boolean;
    /** Saves the record and what the save hooks add for it, after the record's previous save. */
    save(record: IRecord): Promise<IRecordSaveOperationResult>;
    /**
     * Registers a hook over a record's save.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerSave(hook: GridSaveHook, priority?: number): () => void;
}

export class GridSaves implements IGridSaves {
    public readonly events: IEventEmitter<IGridSavesEvents> = new EventEmitter<IGridSavesEvents>();
    private _services: IGridServiceLocator;
    private _hooks = new HookRegistry<GridSaveHook>();
    private _savingCounts = new Map<string, number>();
    private _lastSaves = new Map<string, Promise<IRecordSaveOperationResult>>();

    constructor(parameters: IGridSavesParameters) {
        this._services = parameters.services;
        this._provider.addEventListener('onBeforeRecordSaved', this._onBeforeRecordSaved);
        this._provider.addEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
        this._services.get('grid').events.addEventListener('onDestroyed', this._onDestroyed);
    }

    public isSaving(record: IRecord): boolean {
        return record.isSaving() || this._isSavingHere(record.getRecordId());
    }

    public async save(record: IRecord): Promise<IRecordSaveOperationResult> {
        const recordId = record.getRecordId();
        this._savingCounts.set(recordId, (this._savingCounts.get(recordId) ?? 0) + 1);
        this.events.dispatchEvent('onSaveStarted', recordId);
        const save = this._saveAfter(record, this._lastSaves.get(recordId));
        this._lastSaves.set(recordId, save);
        const result = await save;
        if (this._lastSaves.get(recordId) === save) {
            this._lastSaves.delete(recordId);
        }
        this._savingCounts.set(recordId, this._savingCounts.get(recordId)! - 1);
        this.events.dispatchEvent('onSaveFinished', result);
        return result;
    }

    public registerSave(hook: GridSaveHook, priority?: number): () => void {
        return this._hooks.register(hook, priority);
    }

    private async _saveAfter(record: IRecord, previousSave?: Promise<IRecordSaveOperationResult>): Promise<IRecordSaveOperationResult> {
        await previousSave;
        const recordId = record.getRecordId();
        const handlers: GridSaveHandler[] = record.isDirty() ? [() => record.save()] : [];
        this._hooks.apply(handlers, { record });
        const results: IRecordSaveOperationResult[] = [];
        for (const handler of handlers) {
            try {
                results.push(await handler());
            }
            catch (error) {
                results.push({ recordId, success: false, fields: [], errors: [{ message: ErrorHelper.getMessageFromError(error) }] });
            }
        }
        return {
            recordId,
            success: results.every(result => result.success),
            fields: results.flatMap(result => result.fields ?? []),
            errors: results.flatMap(result => result.errors ?? []),
        };
    }

    private _isSavingHere(recordId: string): boolean {
        return !!this._savingCounts.get(recordId);
    }

    //a save the grid runs reports itself once its hooks are done too
    private _onBeforeRecordSaved = (record: IRecord): void => {
        if (!this._isSavingHere(record.getRecordId())) {
            this.events.dispatchEvent('onSaveStarted', record.getRecordId());
        }
    };

    private _onAfterRecordSaved = (result: IRecordSaveOperationResult): void => {
        if (!this._isSavingHere(result.recordId)) {
            this.events.dispatchEvent('onSaveFinished', result);
        }
    };

    //the provider outlives the grid
    private _onDestroyed = (): void => {
        this._provider.removeEventListener('onBeforeRecordSaved', this._onBeforeRecordSaved);
        this._provider.removeEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
        this.events.clearEventListeners();
    };

    private get _provider() {
        return this._services.get('provider');
    }
}
