/** Finds services by name. */
export interface IServiceLocator<TServiceMap extends object> {
    /** @throws When nothing is registered under `key`. */
    get<TKey extends keyof TServiceMap>(key: TKey): TServiceMap[TKey];
    find<TKey extends keyof TServiceMap>(key: TKey): TServiceMap[TKey] | undefined;
    /**
     * Calls `callback` with the service now and after every registration.
     * @returns Stops observing and runs the last cleanup.
     */
    observe<TKey extends keyof TServiceMap>(key: TKey, callback: ServiceObserver<TServiceMap[TKey]>): () => void;
}

/** A locator that services are registered on. */
export interface IServiceRegistry<TServiceMap extends object> extends IServiceLocator<TServiceMap> {
    /** `getter` runs on every lookup, so it returns an instance rather than building one. */
    register<TKey extends keyof TServiceMap>(key: TKey, getter: () => TServiceMap[TKey]): void;
    unregister<TKey extends keyof TServiceMap>(key: TKey): void;
    /** Drops every service and observer; later registrations and observers are ignored. */
    destroy(): void;
}

/** Handed the service on each registration; what it returns runs before the next call and on unsubscribe. */
export type ServiceObserver<TService> = (service: TService) => void | (() => void);
