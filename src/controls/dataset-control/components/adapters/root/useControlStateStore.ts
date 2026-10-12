import { useMemo } from "react";
import { IStateStore, StateStore, useStateStore } from "@utils";
import { useDatasetControlRuntime } from "./context";

/**
 * The store a control keeps its state in, per view inside a DatasetControl.
 * @param stateKey Read once, at mount; without one, the control keeps nothing.
 */
export const useControlStateStore = (stateKey: string | undefined): IStateStore => {
    const datasetControl = useDatasetControlRuntime();
    const stateStore = useStateStore();
    return useMemo(() => {
        if (!stateKey) {
            return new StateStore();
        }
        if (datasetControl) {
            return datasetControl.getViewStateStore().scope(stateKey);
        }
        return stateStore.scope(stateKey);
    }, []);
};
