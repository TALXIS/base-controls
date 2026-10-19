import React from "react";
import { useContextWithNullCheck } from "@utils";
import { IDatasetControl, IDatasetControlRuntime } from "../../../runtime";

export const DatasetControlRuntimeContext = React.createContext<IDatasetControlRuntime | null>(null);

DatasetControlRuntimeContext.displayName = "DatasetControlRuntimeContext";

/** The runtime of the `DatasetControl` the component is inside of, if any. */
export const useDatasetControlRuntime = (): IDatasetControlRuntime | undefined => {
    return React.useContext(DatasetControlRuntimeContext) ?? undefined;
};

/** The runtime of the `DatasetControl` the part is inside of; throws outside one. */
export const useRequiredDatasetControlRuntime = (): IDatasetControlRuntime => {
    return useContextWithNullCheck(DatasetControlRuntimeContext);
};

/** The `DatasetControl` the component is inside of, typed by its views' data; throws outside one. */
export const useDatasetControl = <TData = unknown>(): IDatasetControl<TData> => {
    return useRequiredDatasetControlRuntime() as IDatasetControl<TData>;
};
