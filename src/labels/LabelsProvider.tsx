import React, { useContext, useMemo } from "react";
import { LabelsService } from "./LabelsService";
import type { Labels } from "./types";

export const LabelsContext = React.createContext(new LabelsService());

export interface ILabelsProviderProps {
    /** Anything left out keeps the outer provider's string or its default. */
    labels: Labels;
    children: React.ReactNode;
}

/** Provides the strings of every component and control runtime mounted below it. */
export const LabelsProvider = (props: ILabelsProviderProps) => {
    const parent = useContext(LabelsContext);
    const labelsService = useMemo(() => parent.merge(props.labels), [parent, props.labels]);
    return <LabelsContext.Provider value={labelsService}>{props.children}</LabelsContext.Provider>;
};
