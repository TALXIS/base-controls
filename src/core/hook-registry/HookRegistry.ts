/** One hook, and where it sits in the order they run in. */
interface IHookEntry<THook> {
    hook: THook;
    priority: number;
}

/** One place to hook into; what `add` returns takes the hook back off. */
export interface IHookPoint<THook extends (...args: any[]) => void> {
    /** @param priority Ascending: a higher number runs later. */
    add(hook: THook, priority?: number): () => void;
}

export interface IHookRegistryParameters {
    /** Called after a hook is added or taken off. */
    onChange?: () => void;
}

/**
 * The hooks something was given, in the order they run.
 *
 * One definition of what priority means, for every seam that takes hooks: ascending, defaulting to `0`,
 * and hooks sharing a priority run in the order they were added — which is what a stable `sort`
 * gives. The sorting happens when one is added, so applying them only walks the list.
 *
 * A hook returns nothing: it mutates what it is handed rather than replacing it, so the owner keeps
 * whatever it was going to hand on. See `SavedQueryHook` or `GridColumnDefinitionsHook`.
 */
export class HookRegistry<THook extends (...args: any[]) => void> implements IHookPoint<THook> {
    private _hooks: IHookEntry<THook>[] = [];
    private _onChange?: () => void;

    constructor(parameters: IHookRegistryParameters = {}) {
        this._onChange = parameters.onChange;
    }

    /**
     * @param priority Ascending: a higher number runs later.
     * @returns Takes the hook back off; keep it when the hook lives shorter than the registry.
     */
    public add(hook: THook, priority: number = 0): () => void {
        this._hooks.push({ hook, priority });
        this._hooks.sort((left, right) => left.priority - right.priority);
        this._onChange?.();
        return () => {
            this._hooks = this._hooks.filter(entry => entry.hook !== hook);
            this._onChange?.();
        };
    }

    /** Runs every hook in order, with whatever the owner hands over. */
    public apply(...args: Parameters<THook>): void {
        for (const { hook } of this._hooks) {
            hook(...args);
        }
    }

    /** Runs every hook in order, awaiting each one before the next. */
    public async applyAsync(...args: Parameters<THook>): Promise<void> {
        for (const { hook } of this._hooks) {
            await hook(...args);
        }
    }
}
