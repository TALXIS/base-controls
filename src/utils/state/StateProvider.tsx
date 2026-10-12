import { useMemo } from "react";
import { StateContext } from "./context";
import { IStateStore, StateStore } from "./StateStore";

export interface IStateProviderProps {
    /** The store to hand down; a fresh in-memory one when left out. */
    store?: IStateStore;
    children?: React.ReactNode;
}

/** Hands one state store to every control below it. */
export const StateProvider = (props: IStateProviderProps) => {
    const ownStore = useMemo(() => new StateStore(), []);
    return <StateContext.Provider value={props.store ?? ownStore}>{props.children}</StateContext.Provider>;
};
