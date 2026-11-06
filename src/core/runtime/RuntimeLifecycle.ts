import { EventEmitter } from "@talxis/client-libraries";
import type { IEventSubscriber } from "../events";

export type RuntimeStatus = 'initializing' | 'ready' | 'failed' | 'destroyed';

/** What every runtime raises over its one mount. */
export interface IRuntimeEvents {
    /** Init succeeded; the control is drawn and usable. */
    onReady: () => void;
    onInitFailed: (error: unknown) => void;
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
}

/** What every runtime offers the code that uses it; a control's public interface extends this. */
export interface IRuntime {
    readonly lifecycle: IRuntimeLifecycle;
}

export interface IRuntimeLifecycleParameters {
    /** Prepares what the control needs before it is shown; the runtime is ready at once without it. */
    onInit?: () => Promise<void>;
    /** Releases what the runtime holds, after `onDestroyed`. */
    onDestroy?: () => void;
}

/** One mount's status, error and events; a runtime owns one, and the host drives it. */
export class RuntimeLifecycle implements IRuntimeLifecycle {
    public readonly events = new EventEmitter<IRuntimeEvents>();
    private _parameters: IRuntimeLifecycleParameters;
    private _status: RuntimeStatus = 'initializing';
    private _error?: unknown;
    private _isInitCalled = false;

    constructor(parameters: IRuntimeLifecycleParameters = {}) {
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
        if (!this.isDestroyed()) {
            this.events.dispatchEvent('onRemountRequested');
        }
    }

    /** Called once by the host; a second call throws, as a remount makes a new runtime instead. */
    public async init(): Promise<void> {
        if (this._isInitCalled) {
            throw new Error('A runtime is initialized only once: remount() makes a new one.');
        }
        this._isInitCalled = true;
        try {
            await this._parameters.onInit?.();
        }
        catch (error) {
            if (!this.isDestroyed()) {
                this._error = error;
                this._status = 'failed';
                this.events.dispatchEvent('onInitFailed', error);
            }
            return;
        }
        if (!this.isDestroyed()) {
            this._status = 'ready';
            this.events.dispatchEvent('onReady');
        }
    }

    /** Called once by the host as the mount goes. */
    public destroy(): void {
        this._status = 'destroyed';
        this.events.dispatchEvent('onDestroyed');
        this._parameters.onDestroy?.();
        this.events.clearEventListeners();
    }
}
