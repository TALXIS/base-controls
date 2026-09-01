/**
 * Where whatever is registered under a name is reached, for any map of names to contracts.
 *
 * Resolution is lazy — a resolver runs on each `get` — so a service can be registered before the thing
 * it returns exists. The rule that makes that safe: resolve in methods, never in a constructor.
 */
export interface IServiceLocator<TServiceMap extends object> {
    /**
     * The service, for what your code cannot work without.
     * @throws When nothing registered it.
     */
    get<TKey extends keyof TServiceMap>(key: TKey): TServiceMap[TKey];
    /** The service, or `undefined` when nothing registered it — for a feature that may simply be off. */
    find<TKey extends keyof TServiceMap>(key: TKey): TServiceMap[TKey] | undefined;
    /** Registers how a service is reached. Registering the same key again replaces it. */
    register<TKey extends keyof TServiceMap>(key: TKey, resolve: () => TServiceMap[TKey]): void;
    /**
     * Runs the callback with the service as soon as there is one — immediately when it already resolves,
     * otherwise the moment something registers it. For wiring that belongs in a constructor but needs a
     * service that has not been built yet.
     *
     * Runs at most once per callback. A service that is never registered simply never calls back.
     */
    whenAvailable<TKey extends keyof TServiceMap>(key: TKey, callback: (service: TServiceMap[TKey]) => void): void;
    /**
     * Releases what the locator holds: the resolvers, and the callbacks still waiting on a key. Both close
     * over whatever built them, so this is what stops a locator from keeping its owner reachable.
     *
     * Afterwards `find` returns `undefined` and `get` throws, while `register` and `whenAvailable` do
     * nothing — a late registration from something still tearing down is not an error.
     */
    destroy(): void;
}
