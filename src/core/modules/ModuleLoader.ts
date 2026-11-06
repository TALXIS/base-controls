import { ServiceLocator } from "../service-locator/ServiceLocator";
import type { IServiceLocator } from "../service-locator/interfaces";

/** What a module's `onLoad` gets besides its host. */
export interface IModuleLoadParameters {
    /** Aborted when the mount goes or another module fails, so a load can cancel what it started. */
    signal: AbortSignal;
}

/** A feature a runtime loads on every mount. */
export interface IRuntimeModule<TMap extends object, TName extends keyof TMap, THost> {
    /** Unique within the runtime; what `onLoad` returns is registered under it. */
    name: TName;
    /** Lower loads first; modules of the same priority load at the same time. Defaults to `0`. */
    priority?: number;
    onLoad(host: THost, context: IModuleLoadParameters): TMap[TName] | Promise<TMap[TName]>;
    /** Called as the mount goes, with what `onLoad` returned. */
    onDestroy?(instance: TMap[TName]): void;
}

interface ILoadedModule<TMap extends object, THost> {
    module: IRuntimeModule<TMap, keyof TMap, THost>;
    instance: TMap[keyof TMap];
}

/** Loads a runtime's modules by priority, registers them, and tears them down in reverse. */
export class ModuleLoader<TMap extends object, THost> {
    private _modules = new ServiceLocator<TMap>();
    private _loaded: ILoadedModule<TMap, THost>[] = [];
    private _abortController = new AbortController();

    /** The loaded modules, by name. */
    public get modules(): IServiceLocator<TMap> {
        return this._modules;
    }

    /** Loads the modules; on a failure, destroys what loaded and rethrows the module's error. */
    public async load(modules: IRuntimeModule<TMap, keyof TMap, THost>[], host: THost): Promise<void> {
        const names = new Set<keyof TMap>();
        for (const module of modules) {
            if (names.has(module.name)) {
                throw new Error(`Module "${String(module.name)}" is registered twice.`);
            }
            names.add(module.name);
        }
        for (const group of this._groupByPriority(modules)) {
            if (this._abortController.signal.aborted) {
                return;
            }
            const results = await Promise.allSettled(group.map(module => this._loadModule(module, host)));
            const loaded = group.flatMap((module, index) => {
                const result = results[index];
                return result.status === 'fulfilled' ? [{ module, instance: result.value }] : [];
            });
            const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
            if (failure) {
                this._destroyModules(loaded);
                this._destroyModules(this._loaded);
                this._loaded = [];
                throw failure.reason;
            }
            //the mount went while the group loaded, so destroy() has already run without it
            if (this._abortController.signal.aborted) {
                this._destroyModules(loaded);
                return;
            }
            for (const entry of loaded) {
                this._loaded.push(entry);
                this._modules.register(entry.module.name, () => entry.instance);
            }
        }
    }

    /** Aborts a load still running and destroys every loaded module, the last loaded first. */
    public destroy(): void {
        this._abortController.abort();
        const error = this._destroyModules(this._loaded);
        this._loaded = [];
        this._modules.destroy();
        if (error) {
            throw error.reason;
        }
    }

    private async _loadModule(module: IRuntimeModule<TMap, keyof TMap, THost>, host: THost): Promise<TMap[keyof TMap]> {
        try {
            return await module.onLoad(host, { signal: this._abortController.signal });
        }
        catch (error) {
            //the rest of the group can stop as soon as one fails
            this._abortController.abort();
            throw error;
        }
    }

    //sorted ascending, keeping the listed order within a priority
    private _groupByPriority(modules: IRuntimeModule<TMap, keyof TMap, THost>[]): IRuntimeModule<TMap, keyof TMap, THost>[][] {
        const groups = new Map<number, IRuntimeModule<TMap, keyof TMap, THost>[]>();
        for (const module of modules) {
            const priority = module.priority ?? 0;
            groups.set(priority, [...groups.get(priority) ?? [], module]);
        }
        return [...groups.entries()].sort(([a], [b]) => a - b).map(([, group]) => group);
    }

    //every module is destroyed even when one throws; the first error is returned
    private _destroyModules(loaded: ILoadedModule<TMap, THost>[]): { reason: unknown } | undefined {
        let error: { reason: unknown } | undefined;
        for (const { module, instance } of [...loaded].reverse()) {
            try {
                module.onDestroy?.(instance);
            }
            catch (reason) {
                error ??= { reason };
            }
            if (this._modules.find(module.name) as unknown === instance) {
                this._modules.unregister(module.name);
            }
        }
        return error;
    }
}
