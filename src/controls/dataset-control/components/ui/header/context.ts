import { createContext, useContext } from "react";

/** What a part inside `DatasetControl.Header` can ask of the header. */
export interface IDatasetControlHeader {
    /** Hides everything in the header except the element with `className` and what holds it. */
    showOnly: (className: string) => void;
    /** Shows everything `showOnly` hid. */
    showAll: () => void;
}

export const DatasetControlHeaderContext = createContext<IDatasetControlHeader | undefined>(undefined);

/** The header the component is inside of, or `undefined` outside one. */
export const useDatasetControlHeader = () => useContext(DatasetControlHeaderContext);
