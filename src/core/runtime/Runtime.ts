import { IServiceLocator, IServiceRegistry, ServiceRegistry } from "../services";
import { IRuntimeModule, ModuleLoader } from "../modules";
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

/** What a runtime is built on: its lifecycle, loading, executor, parts and modules. */
export abstract class Runtime<TPartMap extends IRuntimePartMap = IRuntimePartMap, TModuleMap extends object = {}, THost = IRuntime> implements IRuntime {
    private _parts = new ServiceRegistry<TPartMap>();
    private _moduleLoader = new ModuleLoader<TModuleMap, THost>();
    public readonly parts: IRuntimeParts<TPartMap> = this._parts;
    public readonly lifecycle = new RuntimeLifecycle({ onInit: () => this._init(), onDestroy: () => this._destroy() });
    public readonly loading = new RuntimeLoading({ lifecycle: this.lifecycle });
    public readonly executor = new RuntimeExecutor({ loading: this.loading });
    public readonly execute = this.executor.execute.bind(this.executor);

    public get notifications(): IRuntimeNotifications {
        return this.parts.get('notifications');
    }

    /** The modules this mount loaded, by name. */
    public get modules(): IServiceLocator<TModuleMap> {
        return this._moduleLoader.modules;
    }

    /** The modules to load on every mount, before `onInit`. */
    protected getModules(): IRuntimeModule<TModuleMap, keyof TModuleMap, THost>[] {
        return [];
    }

    /** Prepares the control before it is drawn, once its modules have loaded. */
    protected abstract onInit(): Promise<void>;
    /** Releases what the runtime holds, after `onDestroyed` and its modules have gone. */
    protected abstract onDestroy(): void;

    private async _init(): Promise<void> {
        //a runtime is its own modules' host
        await this._moduleLoader.load(this.getModules(), this as unknown as THost);
        if (!this.lifecycle.isDestroyed()) {
            await this.onInit();
        }
    }

    private _destroy(): void {
        this._moduleLoader.destroy();
        this.onDestroy();
        this._parts.destroy();
    }
}
