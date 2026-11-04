import { IServiceRegistry, ServiceObserver } from "./interfaces";

interface IObserver {
    callback: ServiceObserver<any>;
    cleanup?: () => void;
}

/** Services registered by name; type it at construction, as in `new ServiceLocator<IGanttServiceMap>()`. */
export class ServiceLocator<TServiceMap extends object> implements IServiceRegistry<TServiceMap> {
    private _getters = new Map<keyof TServiceMap, () => unknown>();
    private _observers = new Map<keyof TServiceMap, Set<IObserver>>();
    private _isDestroyed = false;

    public get<TKey extends keyof TServiceMap>(key: TKey): TServiceMap[TKey] {
        const service = this.find(key);
        if (service === undefined) {
            throw new Error(`The "${String(key)}" service is not registered. Use find() if it is optional, or observe() if it is registered later.`);
        }
        return service;
    }

    public find<TKey extends keyof TServiceMap>(key: TKey): TServiceMap[TKey] | undefined {
        return this._getters.get(key)?.() as TServiceMap[TKey] | undefined;
    }

    public register<TKey extends keyof TServiceMap>(key: TKey, getter: () => TServiceMap[TKey]): void {
        if (this._isDestroyed) {
            return;
        }
        this._getters.set(key, getter);
        //the getter runs only when something observes the key
        const observers = this._observers.get(key);
        if (observers?.size) {
            const service = this.find(key);
            observers.forEach(observer => this._notify(observer, service));
        }
    }

    public observe<TKey extends keyof TServiceMap>(key: TKey, callback: ServiceObserver<TServiceMap[TKey]>): () => void {
        if (this._isDestroyed) {
            return () => undefined;
        }
        const observer: IObserver = { callback };
        const observers = this._observers.get(key) ?? new Set();
        this._observers.set(key, observers.add(observer));
        this._notify(observer, this.find(key));
        return () => {
            if (observers.delete(observer)) {
                this._cleanUp(observer);
            }
        };
    }

    public unregister<TKey extends keyof TServiceMap>(key: TKey): void {
        this._getters.delete(key);
        this._observers.get(key)?.forEach(this._cleanUp);
    }

    public destroy(): void {
        this._isDestroyed = true;
        this._getters.clear();
        this._observers.forEach(observers => observers.forEach(this._cleanUp));
        this._observers.clear();
    }

    //a getter over something not assigned yet returns undefined, and the observer waits for the next one
    private _notify(observer: IObserver, service: unknown): void {
        if (service === undefined) {
            return;
        }
        this._cleanUp(observer);
        const cleanup = observer.callback(service);
        observer.cleanup = typeof cleanup === 'function' ? cleanup : undefined;
    }

    private _cleanUp = (observer: IObserver): void => {
        const cleanup = observer.cleanup;
        observer.cleanup = undefined;
        cleanup?.();
    };
}
