import { createContext, useContext } from "react";
import type { IRuntime, RuntimeStatus } from "@core";

export const RuntimeContext = createContext<IRuntime | null>(null);

export const RuntimeStatusContext = createContext<RuntimeStatus | null>(null);

/** The runtime of the nearest `RuntimeHost`; for the control's own mount component only, as hosts nest. */
export const useRuntime = <TRuntime extends IRuntime>(): TRuntime => {
    //read only to re-render the caller when the status changes
    useContext(RuntimeStatusContext);
    const runtime = useContext(RuntimeContext);
    if (!runtime) {
        throw new Error('useRuntime needs a RuntimeHost above it.');
    }
    return runtime as TRuntime;
};
