import React, { useMemo } from "react";
import { IStateStore, StateStore } from "./StateStore";

//the store every control shares when no StateProvider is mounted
export const StateContext = React.createContext<IStateStore>(new StateStore());

StateContext.displayName = "StateContext";

/** Returns the store from the nearest `StateProvider` or runtime, or the page-wide one without either. */
export const useStateStore = (): IStateStore => React.useContext(StateContext);

/**
 * The store a control keeps its state in, scoped under the nearest runtime or `StateProvider`.
 * @param stateKey Read once, at mount; without one, the control keeps nothing.
 */
export const useControlStateStore = (stateKey: string | undefined): IStateStore => {
    const stateStore = useStateStore();
    return useMemo(() => stateKey ? stateStore.scope(stateKey) : new StateStore(), []);
};
