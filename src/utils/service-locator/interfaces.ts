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
     *   {@link IServiceLocator.whenAvailable} and resolving-in-methods work.
     */
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
