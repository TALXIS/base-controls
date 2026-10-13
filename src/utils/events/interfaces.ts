/** Subscribing to an emitter's events, without dispatching them. */
export interface IEventSubscriber<T extends { [K in keyof T]: (...args: any[]) => any }> {
    /** Calls `callback` every time `event` is raised. */
    addEventListener<K extends keyof T>(event: K, callback: T[K]): void;
    /** Stops calling `callback`, which must be the function that was added. */
    removeEventListener<K extends keyof T>(event: K, callbackToRemove: T[K]): void;
}
