import React from "react";

/** Which side of the header or footer a part is in. */
export type IDatasetControlRegion = 'start' | 'end';

export const DatasetControlRegionContext = React.createContext<IDatasetControlRegion | undefined>(undefined);

DatasetControlRegionContext.displayName = "DatasetControlRegionContext";

/** The side of the header or footer the part is in; `undefined` outside both regions. */
export const useDatasetControlRegion = (): IDatasetControlRegion | undefined => React.useContext(DatasetControlRegionContext);
