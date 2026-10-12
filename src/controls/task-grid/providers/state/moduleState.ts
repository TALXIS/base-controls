import type { ITaskGridServiceLocator } from "@controls/task-grid/services";
import { ISavedQueryModuleState } from "../saved-query";

/** Where the features' slices sit in the view's store; a personal view saves the whole entry. */
export const MODULES_STATE_KEY = 'modules';

/** One feature's slice of what the view keeps. */
export interface IModuleState<TState extends object> {
    /** The slice as it stands; empty on a view that never stored one. */
    get: () => Readonly<TState>;
    /** Merges a patch into the slice. */
    set: (patch: Partial<TState>) => void;
}

/**
 * A feature's slice of the view loaded last, or being loaded, saved into a personal view with it.
 * @param key What the slice is stored under; part of what a personal view saves, so pick it once.
 */
export const moduleState = <TState extends object>(services: ITaskGridServiceLocator, key: string): IModuleState<TState> => {
    const getStore = () => services.get('taskGrid').getViewStateStore();
    const getSlices = () => getStore().get<ISavedQueryModuleState>(MODULES_STATE_KEY) ?? {};
    return {
        get: () => ({ ...getSlices()[key] as TState }),
        set: patch => {
            const slices = getSlices();
            getStore().set<ISavedQueryModuleState>(MODULES_STATE_KEY, { ...slices, [key]: { ...slices[key] as TState, ...patch } });
        },
    };
};
