import { IServiceLocator } from "./interfaces";

/**
 * A {@link IServiceLocator}: a map of resolvers and nothing else.
 *
 * Name the map at the construction site — `new ServiceLocator<IGanttServiceMap>()` — rather than
 * subclassing. Reaching some other locator from this one is the caller's business: register it under a key
 * of its own.
 */
export class ServiceLocator<TServiceMap extends object> implements IServiceLocator<TServiceMap> {
    private _resolvers: Map<keyof TServiceMap, () => unknown> = new Map();
    private _pendingCallbacks: Map<keyof TServiceMap, ((service: any) => void)[]> = new Map();
    private _isDestroyed = false;

    public get<TKey extends keyof TServiceMap>(key: TKey): TServiceMap[TKey] {
        const service = this.find(key);
        if (service === undefined) {
            throw new Error(`No "${String(key)}" is registered with this service locator. An optional feature's service is only there when that feature is — reach for it with find(), and resolve services in methods rather than in a constructor.`);
        }
        return service;
    }

    public find<TKey extends keyof TServiceMap>(key: TKey): TServiceMap[TKey] | undefined {
        //the resolver runs per lookup and nothing is memoized: `() => new Something()` is a different
        //instance to every caller, which is why a resolver hands back something already built
        return this._resolvers.get(key)?.() as TServiceMap[TKey] | undefined;
    }

    public register<TKey extends keyof TServiceMap>(key: TKey, resolve: () => TServiceMap[TKey]): void {
        if (this._isDestroyed) {
            return;
        }
        this._resolvers.set(key, resolve);
        const waiting = this._pendingCallbacks.get(key);
        //nothing is waiting, so the resolver stays untouched and lazy
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

    public whenAvailable<TKey extends keyof TServiceMap>(key: TKey, callback: (service: TServiceMap[TKey]) => void): void {
        if (this._isDestroyed) {
            return;
        }
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

    public destroy(): void {
        this._isDestroyed = true;
        this._resolvers.clear();
        this._pendingCallbacks.clear();
    }
}
