import { ITaskGridServiceLocator, ITaskGridServiceMap } from "./interfaces";

/**
 * The grid's {@link ITaskGridServiceLocator}: a map of resolvers and nothing else.
 *
 * Built by `TaskGridDatasetControlFactory`, which registers the grid's own services over its local
 * bindings before they are assigned — resolving happens at call time, so the order things are built in
 * stops mattering.
 */
export class ServiceLocator implements ITaskGridServiceLocator {
    private _resolvers: Map<keyof ITaskGridServiceMap, () => unknown> = new Map();

    public get<TKey extends keyof ITaskGridServiceMap>(key: TKey): ITaskGridServiceMap[TKey] {
        const service = this.find(key);
        if (service === undefined) {
            throw new Error(`No "${key}" is registered with this TaskGrid. A module's service is only there when its module is — reach for it with find() when the feature is optional, and resolve services in methods rather than in a constructor.`);
        }
        return service;
    }

    public find<TKey extends keyof ITaskGridServiceMap>(key: TKey): ITaskGridServiceMap[TKey] | undefined {
        return this._resolvers.get(key)?.() as ITaskGridServiceMap[TKey] | undefined;
    }

    public register<TKey extends keyof ITaskGridServiceMap>(key: TKey, resolve: () => ITaskGridServiceMap[TKey]): void {
        this._resolvers.set(key, resolve);
    }
}
