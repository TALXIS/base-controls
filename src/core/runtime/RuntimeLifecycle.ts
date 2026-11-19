import { EventEmitter } from "@talxis/client-libraries";
import type { IEventSubscriber } from "../events";

/** `rendering`: the control is drawn while its parts finish; `ready` follows once they have. */
export type RuntimeStatus = 'initializing' | 'rendering' | 'ready' | 'failed' | 'destroyed';

/** What every runtime raises over its one mount. */
export interface IRuntimeEvents {
    /** `failed` means init or a promise it waited for threw; `getError()` holds what. */
    onStatusChanged: (status: RuntimeStatus) => void;
    /** The runtime asks the host to replace it with a new one. */
    onRemountRequested: () => void;
    onDestroyed: () => void;
}

/** A runtime's lifecycle as the code using the runtime sees it. */
export interface IRuntimeLifecycle {
    readonly events: IEventSubscriber<IRuntimeEvents>;
    getStatus(): RuntimeStatus;
    /** What init threw, while the status is `failed`. */
    getError(): unknown;
    isDestroyed(): boolean;
    /** Replaces the runtime with a new one; this one is destroyed. */
    remount(): void;
    /** Holds the status back from `ready` until the promise settles; a rejection fails the mount. */
    waitUntil(promise: Promise<unknown>): void;
}

export interface IRuntimeLifecycleParameters {
    onInit: () => Promise<void>;
    onDestroy: () => void;
}

/** One mount's status, error and events; a runtime owns one, and the host drives it. */
export class RuntimeLifecycle implements IRuntimeLifecycle {
    public readonly events = new EventEmitter<IRuntimeEvents>();
    private _parameters: IRuntimeLifecycleParameters;
    private _status: RuntimeStatus = 'initializing';
    private _error?: unknown;
    private _pending: Promise<unknown>[] = [];

    constructor(parameters: IRuntimeLifecycleParameters) {
        this._parameters = parameters;
    }

    public getStatus(): RuntimeStatus {
        return this._status;
    }

    public getError(): unknown {
        return this._error;
    }

    public isDestroyed(): boolean {
        return this._status === 'destroyed';
    }

    public remount(): void {
        this.events.dispatchEvent('onRemountRequested');
    }

    public waitUntil(promise: Promise<unknown>): void {
        this._pending.push(promise);
    }

    /** Holds the parent back from `ready` until this mount is ready, has failed or is gone. */
    public attachParent(parent: IRuntimeLifecycle | undefined): void {
        parent?.waitUntil(new Promise<void>(resolve => {
            const stopListening = this.events.addEventListener('onStatusChanged', status => {
                if (status !== 'rendering') {
                    stopListening();
                    resolve();
                }
            });
        }));
    }

    /** Called once by the host; a failure sets `failed`, then rethrows. */
    public async init(): Promise<void> {
        try {
            await this._parameters.onInit();
        }
        catch (error) {
            this._fail(error);
            throw error;
        }
        this._setStatus('rendering');
    }

    /** Called by the host once it has drawn the control; a failure sets `failed`, then rethrows. */
    public async awaitReady(): Promise<void> {
        try {
            await Promise.all(this._pending);
        }
        catch (error) {
            this._fail(error);
            throw error;
        }
        this._setStatus('ready');
    }

    /** Called by the host as the mount goes; later calls do nothing. */
    public destroy(): void {
        if (this.isDestroyed()) {
            return;
        }
        this._setStatus('destroyed');
        this.events.dispatchEvent('onDestroyed');
        this._parameters.onDestroy();
        this.events.clearEventListeners();
    }

    //a mount destroyed while it waited stays destroyed
    private _setStatus(status: RuntimeStatus): void {
        if (this.isDestroyed()) {
            return;
        }
        this._status = status;
        this.events.dispatchEvent('onStatusChanged', status);
    }

    private _fail(error: unknown): void {
        this._error = error;
        this._setStatus('failed');
    }
}
