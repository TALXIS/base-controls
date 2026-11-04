import { IServiceLocator, ServiceObserver } from "./interfaces";

/**
 * A {@link IServiceLocator}: a map of resolvers and nothing else.
 *
 * Name the map at the construction site — `new ServiceLocator<IGanttServiceMap>()` — rather than
 * subclassing. Reaching some other locator from this one is the caller's business: register it under a key
 * of its own.
 */
interface IObserver {
    callback: ServiceObserver<any>;
    cleanup?: () => void;
}

export class ServiceLocator<TServiceMap extends object> implements IServiceLocator<TServiceMap> {
    private _resolvers: Map<keyof TServiceMap, () => unknown> = new Map();
    private _observers: Map<keyof TServiceMap, Set<IObserver>> = new Map();
    private _isDestroyed = false;

    public get<TKey extends keyof TServiceMap>(key: TKey): TServiceMap[TKey] {
        const service = this.find(key);
        if (service === undefined) {
            throw new Error(`The "${String(key)}" service is not registered. Use find() if it is optional, or observe() if it is registered later.`);
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
        const observers = this._observers.get(key);
        //nothing observes it, so the resolver stays untouched and lazy
        if (!observers?.size) {
            return;
        }
        //a resolver over a binding its owner has not assigned yet: the observers wait for one that has
        const service = this.find(key);
        if (service !== undefined) {
            observers.forEach(observer => this._notify(observer, service));
        }
    }

    public observe<TKey extends keyof TServiceMap>(key: TKey, callback: ServiceObserver<TServiceMap[TKey]>): () => void {
        if (this._isDestroyed) {
            return () => undefined;
        }
        const observer: IObserver = { callback };
        const observers = this._observers.get(key) ?? new Set();
        observers.add(observer);
        this._observers.set(key, observers);
        const service = this.find(key);
        if (service !== undefined) {
            this._notify(observer, service);
        }
        return () => {
            if (observers.delete(observer)) {
                this._cleanUp(observer);
            }
        };
    }

    public unregister<TKey extends keyof TServiceMap>(key: TKey): void {
        this._resolvers.delete(key);
        this._observers.get(key)?.forEach(observer => this._cleanUp(observer));
    }

    public destroy(): void {
        this._isDestroyed = true;
        this._resolvers.clear();
        this._observers.forEach(observers => observers.forEach(observer => this._cleanUp(observer)));
        this._observers.clear();
    }

    private _notify(observer: IObserver, service: unknown): void {
        this._cleanUp(observer);
        const cleanup = observer.callback(service);
        observer.cleanup = typeof cleanup === 'function' ? cleanup : undefined;
    }

    private _cleanUp(observer: IObserver): void {
        const cleanup = observer.cleanup;
        observer.cleanup = undefined;
        cleanup?.();
    }
}
