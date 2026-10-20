import { EventEmitter, IRawRecord } from "@talxis/client-libraries";

export interface IMemoryTaskFormEvents {
    onChanged: () => void;
}

/** The task the memory form shows, and the open waiting for it to close. */
export class MemoryTaskForm {
    public readonly events = new EventEmitter<IMemoryTaskFormEvents>();
    private _task?: IRawRecord;
    private _isReadOnly = false;
    private _resolve?: (task: IRawRecord | null) => void;

    /** Shows the task; resolves with it saved, or `null` when dismissed. */
    public open(task: IRawRecord, options?: { isReadOnly?: boolean }): Promise<IRawRecord | null> {
        this._task = task;
        this._isReadOnly = !!options?.isReadOnly;
        this.events.dispatchEvent('onChanged');
        return new Promise(resolve => this._resolve = resolve);
    }

    /** The copy the form edits; `undefined` while closed. */
    public getTask(): IRawRecord | undefined {
        return this._task;
    }

    public isReadOnly(): boolean {
        return this._isReadOnly;
    }

    public save(): void {
        this._close(this._task ?? null);
    }

    public dismiss(): void {
        this._close(null);
    }

    private _close(result: IRawRecord | null): void {
        const resolve = this._resolve;
        this._task = undefined;
        this._resolve = undefined;
        this.events.dispatchEvent('onChanged');
        resolve?.(result);
    }
}

declare module "../../runtime/interfaces" {
    interface ITaskDatasetControlRuntimeModuleServiceMap {
        /** The memory data source's form. */
        memoryTaskForm: MemoryTaskForm;
    }
}
