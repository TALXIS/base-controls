import { ISavedQueryMetadata } from "../saved-query";
import { ITaskGridState } from "./TaskGridState";

/**
 * How long a module's slice lives.
 *
 * `view` follows the view it was set on, and travels with a personal view when one is saved. `session`
 * follows the grid instead: it survives a remount and a view switch, and no view carries it.
 */
export type IModuleStateScope = 'view' | 'session';

/** One module's slice of the grid's state. */
export interface IModuleState<TState extends object> {
    /** The slice as it stands. Empty on a view that never stored one. */
    get: () => Readonly<TState>;
    /** Merges a patch into the slice. */
    set: (patch: Partial<TState>) => void;
}

export interface IModuleStateParameters {
    /** The dictionary the slice is read from and, for `session` scope, written into. */
    state: ITaskGridState;
    /** What the slice is stored under. Part of what a saved view persists, so pick it once. */
    key: string;
    scope: IModuleStateScope;
}

/** Writes one module's slice onto a view's metadata, creating the bag on first write. */
export const setModuleSlice = <TState>(metadata: Partial<ISavedQueryMetadata>, key: string, slice: TState): void => {
    metadata.moduleState ??= {};
    metadata.moduleState[key] = slice;
};

/**
 * Reached through {@link ITaskGridStateProvider.module} rather than called directly — a `view`-scoped slice
 * is only persisted because that method registers the capture hook for it.
 *
 * The slice is read on first use and then held: this is built before the control has any state, and what
 * the previous control left behind is what a remount picks up. A view that stored nothing reads as `{}`
 * rather than throwing — a slice is read while the chart draws, where a throw would break the draw.
 */
export const createModuleState = <TState extends object>(parameters: IModuleStateParameters): IModuleState<TState> => {
    const { state, key, scope } = parameters;
    let slice: TState | undefined;

    const read = (): TState => {
        const stored = scope === 'view'
            ? state.savedQuery?.moduleState?.[key]
            : state.moduleState?.[key];
        return { ...stored as TState };
    };

    const getSlice = (): TState => (slice ??= read());

    return {
        get: () => getSlice(),
        //a view-scoped slice is written when the view is captured, so there is nothing to do here beyond
        //holding it. Session scope has no capture: the dictionary it writes to is the session
        set: (patch) => {
            const next = Object.assign(getSlice(), patch);
            if (scope === 'session') {
                state.moduleState ??= {};
                state.moduleState[key] = next;
            }
        },
    };
};
