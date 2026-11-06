import { IServiceLocator, ServiceRegistry } from "../services";

/** What a module's `onLoad` gets besides its host. */
export interface IModuleLoadParameters {
    /** Aborted when the mount goes or another module fails, so a load can cancel what it started. */
    signal: AbortSignal;
}

/** A feature a runtime loads on every mount. */
export interface IRuntimeModule<TMap extends object, TName extends keyof TMap, THost> {
    /** Unique within the runtime; what `onLoad` returns is provided under it. */
    name: TName;
    /** Lower loads first; modules of the same priority load at the same time. Defaults to `0`. */
    priority?: number;
    onLoad(host: THost, parameters: IModuleLoadParameters): TMap[TName] | Promise<TMap[TName]>;
    /** Called as the mount goes, with what `onLoad` returned. */
    onDestroy?(instance: TMap[TName]): void;
}

interface ILoadedModule<TMap extends object, THost> {
    module: IRuntimeModule<TMap, keyof TMap, THost>;
    instance: TMap[keyof TMap];
}

/** Loads a runtime's modules by priority, provides them, and tears them down in reverse. */
export class ModuleLoader<TMap extends object, THost> {
    private _modules = new ServiceRegistry<TMap>();
    private _removers: (() => void)[] = [];
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
                throw new Error(`Module "${String(module.name)}" is listed twice.`);
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
                this._destroyUnprovided(loaded);
                this._removeProvided();
                throw failure.reason;
            }
            //a mount that went while the group loaded releases them as they are provided
            for (const { module, instance } of loaded) {
                this._removers.push(this._modules.provide(module.name, instance, { onDestroy: loadedInstance => module.onDestroy?.(loadedInstance) }));
            }
        }
    }

    /** Aborts a load still running and destroys every loaded module, the last loaded first. */
    public destroy(): void {
        this._abortController.abort();
        this._removers = [];
        this._modules.destroy();
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

    //never provided, so the registry cannot release them
    private _destroyUnprovided(loaded: ILoadedModule<TMap, THost>[]): void {
        for (const { module, instance } of [...loaded].reverse()) {
            try {
                module.onDestroy?.(instance);
            }
            catch {
                //the load's own error is the one rethrown
            }
        }
    }

    private _removeProvided(): void {
        for (const remove of this._removers.reverse()) {
            try {
                remove();
            }
            catch {
                //the load's own error is the one rethrown
            }
        }
        this._removers = [];
    }
}
