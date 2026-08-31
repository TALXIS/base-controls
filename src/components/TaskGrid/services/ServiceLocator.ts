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
    private _pendingCallbacks: Map<keyof ITaskGridServiceMap, ((service: any) => void)[]> = new Map();

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
        const waiting = this._pendingCallbacks.get(key);
        //nothing is waiting, so the resolver stays untouched and lazy - exactly as before
        if (!waiting) {
            return;
        }
        //a resolver registered over a binding its owner has not assigned yet: still nothing to hand out,
        //so the callbacks keep waiting for the register that has one
        const service = this.find(key);
        if (service === undefined) {
            return;
        }
        this._pendingCallbacks.delete(key);
        for (const callback of waiting) {
            callback(service);
        }
    }

    public whenAvailable<TKey extends keyof ITaskGridServiceMap>(key: TKey, callback: (service: ITaskGridServiceMap[TKey]) => void): void {
        const service = this.find(key);
        if (service !== undefined) {
            callback(service);
            return;
        }
        const waiting = this._pendingCallbacks.get(key);
        if (waiting) {
            waiting.push(callback);
        }
        else {
            this._pendingCallbacks.set(key, [callback]);
        }
    }
}
