import { IServiceRegistry, ServiceRegistry } from "../services";
import { IRuntimeLifecycle, RuntimeLifecycle } from "./RuntimeLifecycle";
import { IRuntimeExecutor, RuntimeExecutor } from "./RuntimeExecutor";
import { IRuntimeLoading, RuntimeLoading } from "./RuntimeLoading";
import type { IRuntimeNotifications } from "./RuntimeNotifications";

/** The parts every runtime may have; a control's own map extends it. */
export interface IRuntimePartMap {
    /** The notification bar, while one is drawn. */
    notifications: IRuntimeNotifications;
}

/** The parts drawn inside a runtime, each there only while it is drawn; the runtime ends them all with it. */
export type IRuntimeParts<TMap extends object> = Omit<IServiceRegistry<TMap>, 'destroy'>;

/** What every runtime offers the code that uses it; a control's public interface extends this. */
export interface IRuntime {
    readonly lifecycle: IRuntimeLifecycle;
    /** What the runtime waits on; its host covers it with an overlay while shown. */
    readonly loading: IRuntimeLoading;
    /** Runs operations that may throw; its host shows their failures. */
    readonly executor: IRuntimeExecutor;
    execute: IRuntimeExecutor['execute'];
    /** The parts drawn inside the runtime, such as its notification bar. */
    readonly parts: IRuntimeParts<IRuntimePartMap>;
    /** The `notifications` part; throws while no notification bar is drawn, so read it from `onReady` on. */
    readonly notifications: IRuntimeNotifications;
}

/** What a runtime is built on: its lifecycle, loading, executor and parts. */
export abstract class Runtime<TPartMap extends IRuntimePartMap = IRuntimePartMap> implements IRuntime {
    private _parts = new ServiceRegistry<TPartMap>();
    public readonly parts: IRuntimeParts<TPartMap> = this._parts;
    public readonly lifecycle = new RuntimeLifecycle({ onInit: () => this.onInit(), onDestroy: () => this._destroy() });
    public readonly loading = new RuntimeLoading({ lifecycle: this.lifecycle });
    public readonly executor = new RuntimeExecutor({ loading: this.loading });
    public readonly execute = this.executor.execute.bind(this.executor);

    public get notifications(): IRuntimeNotifications {
        return this.parts.get('notifications');
    }

    /** Prepares what the control needs before it is drawn; the host runs it once per mount. */
    protected abstract onInit(): Promise<void>;
    /** Releases what the runtime holds, after `onDestroyed`. */
    protected abstract onDestroy(): void;

    private _destroy(): void {
        this.onDestroy();
        this._parts.destroy();
    }
}
