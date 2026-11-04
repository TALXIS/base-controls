import { createContext, useContext, useMemo } from "react";
import { HeaderItemContext } from "../header-item/context";

/** What a part inside `DatasetControl.Header` can ask of the header. */
export interface IDatasetControlHeader {
    /** Hides everything in the header except the part calling it. */
    showOnly: () => void;
    /** Shows everything `showOnly` hid. */
    showAll: () => void;
}

export const SetIsolatedHeaderItemContext = createContext<((element?: Element) => void) | undefined>(undefined);

export const IsolatedHeaderItemContext = createContext<Element | undefined>(undefined);

/** The header the component is inside of, or `undefined` outside one. */
export const useDatasetControlHeader = (): IDatasetControlHeader | undefined => {
    const setIsolated = useContext(SetIsolatedHeaderItemContext);
    const itemRef = useContext(HeaderItemContext);
    return useMemo(() => setIsolated && {
        showOnly: () => setIsolated(itemRef?.current ?? undefined),
        showAll: () => setIsolated(undefined),
    }, [setIsolated, itemRef]);
};
