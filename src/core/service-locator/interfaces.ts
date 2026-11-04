/**
 * Where whatever is registered under a name is reached, for any map of names to contracts.
 *
 * Resolution is lazy — a resolver runs on each `get`, and nothing is cached — so a service can be
 * registered before the thing it returns exists. Two rules follow from that: resolve in methods, never in
 * a constructor; and register an instance you already built rather than a resolver that builds one. See
 * {@link IServiceLocator.register}.
 */
export interface IServiceLocator<TServiceMap extends object> {
    /**
     * The service, for what your code cannot work without.
     * @throws When nothing registered it.
     */
    get<TKey extends keyof TServiceMap>(key: TKey): TServiceMap[TKey];
    /** The service, or `undefined` when nothing registered it — for a feature that may simply be off. */
    find<TKey extends keyof TServiceMap>(key: TKey): TServiceMap[TKey] | undefined;
    /**
     * Registers how a service is reached. Registering the same key again replaces it.
     *
     * `resolve` is a resolver, not a factory: it runs on **every** lookup, and whatever it returns is what
     * that lookup gets. So build the instance first and hand it back —
     * `const part = new Part(); register('part', () => part)` — rather than
     * `register('part', () => new Part())`, which gives every caller a different one. A part that holds
     * anything at all is the case that breaks: registrations made on it, subscriptions, cached work.
     *
     * Two consequences of the same laziness, both worth knowing:
     * - Registering does not construct. A resolver over `new Something()` never runs until something
     *   resolves the key, so a part whose *construction* is the point must be built before it is
     *   registered rather than inside the resolver.
     * - A resolver can be registered before what it returns exists, which is what makes
     *   {@link IServiceLocator.observe} and resolving-in-methods work.
     */
    register<TKey extends keyof TServiceMap>(key: TKey, resolve: () => TServiceMap[TKey]): void;
    /**
     * Runs the callback with the service now if there is one, and again each time something registers it.
     * @returns Stops observing and runs the last cleanup; call it as the owner goes.
     */
    observe<TKey extends keyof TServiceMap>(key: TKey, callback: ServiceObserver<TServiceMap[TKey]>): () => void;
    /** Removes the key's resolver and runs its observers' cleanups, until something registers it again. */
    unregister<TKey extends keyof TServiceMap>(key: TKey): void;
    /**
     * Releases what the locator holds: the resolvers, and the observers after their cleanups. Both close
     * over whatever built them, so this is what stops a locator from keeping its owner reachable.
     *
     * Afterwards `find` returns `undefined` and `get` throws, while `register` and `observe` do
     * nothing — a late registration from something still tearing down is not an error.
     */
    destroy(): void;
}

/** Handed the service each time it is registered; what it returns runs before the next call and as it stops. */
export type ServiceObserver<TService> = (service: TService) => void | (() => void);
