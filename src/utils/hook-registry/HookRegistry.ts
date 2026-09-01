/** One hook, and where it sits in the order they run in. */
interface IRegisteredHook<THook> {
    hook: THook;
    priority: number;
}

/**
 * The hooks something was given, in the order they run.
 *
 * One definition of what priority means, for every seam that takes hooks: ascending, defaulting to `0`,
 * and hooks sharing a priority run in the order they were registered — which is what a stable `sort`
 * gives. The sorting happens on registration, so applying them only walks the list.
 *
 * A hook returns nothing: it mutates what it is handed rather than replacing it, so the owner keeps
 * whatever it was going to hand on. See `SavedQueryHook` or `GridColumnDefinitionsHook`.
 */
export class HookRegistry<THook extends (...args: any[]) => void> {
    private _hooks: IRegisteredHook<THook>[] = [];

    /**
     * @param priority Ascending — a lower number runs earlier, so a higher one gets the later word.
     * Defaults to `0`.
     */
    public register(hook: THook, priority: number = 0): void {
        this._hooks.push({ hook, priority });
        this._hooks.sort((left, right) => left.priority - right.priority);
    }

    /** Runs every hook in order, with whatever the owner hands over. */
    public apply(...args: Parameters<THook>): void {
        for (const { hook } of this._hooks) {
            hook(...args);
        }
    }
}
