import React from "react";
import { IStateStore, StateStore } from "./StateStore";

//the store every control shares when no StateProvider is mounted
export const StateContext = React.createContext<IStateStore>(new StateStore());

StateContext.displayName = "StateContext";

/** Returns the store from the nearest `StateProvider`, or the page-wide one without it. */
export const useStateStore = (): IStateStore => React.useContext(StateContext);
