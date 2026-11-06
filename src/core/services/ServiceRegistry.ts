/** Runs while a service is provided; what it returns runs when that service goes. */
export type ServiceEffect<TService> = (service: TService) => void | (() => void);

export interface IProvideParameters<TService> {
    /** Releases what the service holds when it goes; leave out for a value the registry only borrows. */
    onDestroy?: (service: TService) => void;
}

/** Finds the services of one mount by name. */
export interface IServiceLocator<TMap extends object> {
    /** @throws When nothing is provided under `key`. */
    get<TKey extends keyof TMap>(key: TKey): TMap[TKey];
    find<TKey extends keyof TMap>(key: TKey): TMap[TKey] | undefined;
    has(key: keyof TMap): boolean;
    /** Runs `effect` with the service now if it is there, and again for every later one; returns the stop. */
    observe<TKey extends keyof TMap>(key: TKey, effect: ServiceEffect<TMap[TKey]>): () => void;
}

/** Holds the services of one mount, and ends them all with it. */
export interface IServiceRegistry<TMap extends object> extends IServiceLocator<TMap> {
    /** Provides `service` under `key`, ending what was there; returns the remover of this one only. */
    provide<TKey extends keyof TMap>(key: TKey, service: TMap[TKey], parameters?: IProvideParameters<TMap[TKey]>): () => void;
    /** Ends every service, the last provided first; anything provided afterwards is released at once. */
    destroy(): void;
}

interface IEntry {
    service: unknown;
    onDestroy?: (service: any) => void;
}

interface IObserver {
    effect: ServiceEffect<any>;
    cleanup?: () => void;
}

/** The services of one mount, by name; type it as `new ServiceRegistry<IGridServiceMap>()`. */
export class ServiceRegistry<TMap extends object> implements IServiceRegistry<TMap> {
    //in insertion order, so destroy() ends them last-first
    private _entries = new Map<keyof TMap, IEntry>();
    private _observers = new Map<keyof TMap, Set<IObserver>>();
    private _isDestroyed = false;

    public get<TKey extends keyof TMap>(key: TKey): TMap[TKey] {
        const entry = this._entries.get(key);
        if (!entry) {
            throw new Error(`Nothing is provided as "${String(key)}". Use find() if it is optional, or observe() if it comes later.`);
        }
        return entry.service as TMap[TKey];
    }

    public find<TKey extends keyof TMap>(key: TKey): TMap[TKey] | undefined {
        return this._entries.get(key)?.service as TMap[TKey] | undefined;
    }

    public has(key: keyof TMap): boolean {
        return this._entries.has(key);
    }

    public provide<TKey extends keyof TMap>(key: TKey, service: TMap[TKey], parameters: IProvideParameters<TMap[TKey]> = {}): () => void {
        //a service that arrives after the mount went is released straight away
        if (this._isDestroyed) {
            parameters.onDestroy?.(service);
            return () => undefined;
        }
        this._end(key);
        const entry: IEntry = { service, onDestroy: parameters.onDestroy };
        this._entries.set(key, entry);
        this._runAll([...this._observersOf(key)].map(observer => () => this._apply(observer, service)));
        return () => {
            if (this._entries.get(key) === entry) {
                this._end(key);
            }
        };
    }

    public observe<TKey extends keyof TMap>(key: TKey, effect: ServiceEffect<TMap[TKey]>): () => void {
        if (this._isDestroyed) {
            return () => undefined;
        }
        const observer: IObserver = { effect };
        this._observersOf(key).add(observer);
        const entry = this._entries.get(key);
        if (entry) {
            this._apply(observer, entry.service);
        }
        return () => {
            if (this._observers.get(key)?.delete(observer)) {
                this._cleanUp(observer);
            }
        };
    }

    public destroy(): void {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyed = true;
        try {
            this._runAll([...this._entries.keys()].reverse().map(key => () => this._end(key)));
        }
        finally {
            this._observers.clear();
        }
    }

    //the observers let go first, while the service still works, then its owner releases it
    private _end(key: keyof TMap): void {
        const entry = this._entries.get(key);
        if (!entry) {
            return;
        }
        this._entries.delete(key);
        this._runAll([
            ...[...this._observersOf(key)].map(observer => () => this._cleanUp(observer)),
            () => entry.onDestroy?.(entry.service),
        ]);
    }

    private _apply(observer: IObserver, service: unknown): void {
        this._cleanUp(observer);
        const cleanup = observer.effect(service);
        observer.cleanup = typeof cleanup === 'function' ? cleanup : undefined;
    }

    private _cleanUp = (observer: IObserver): void => {
        const cleanup = observer.cleanup;
        observer.cleanup = undefined;
        cleanup?.();
    };

    private _observersOf(key: keyof TMap): Set<IObserver> {
        let observers = this._observers.get(key);
        if (!observers) {
            observers = new Set();
            this._observers.set(key, observers);
        }
        return observers;
    }

    //every step runs even when one throws; the first error is rethrown at the end
    private _runAll(steps: (() => void)[]): void {
        let error: { reason: unknown } | undefined;
        for (const step of steps) {
            try {
                step();
            }
            catch (reason) {
                error ??= { reason };
            }
        }
        if (error) {
            throw error.reason;
        }
    }
}
