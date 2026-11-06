import React from "react";
import { useContextWithNullCheck } from "@core";
import { IDatasetControl, IDatasetControlInternal } from "../../runtime";

export const DatasetControlContext = React.createContext<IDatasetControlInternal | null>(null);

DatasetControlContext.displayName = "DatasetControlContext";

/** The runtime of the `DatasetControl` the component is inside of, if any. */
export const useOptionalDatasetControlInternal = (): IDatasetControlInternal | undefined => {
    return React.useContext(DatasetControlContext) ?? undefined;
};

/** The runtime of the `DatasetControl` the part is inside of; throws outside one. */
export const useDatasetControlInternal = (): IDatasetControlInternal => {
    return useContextWithNullCheck(DatasetControlContext);
};

/** The `DatasetControl` the component is inside of, typed by its views' data; throws outside one. */
export const useDatasetControl = <TData = unknown>(): IDatasetControl<TData> => {
    return useDatasetControlInternal() as IDatasetControl<TData>;
};
