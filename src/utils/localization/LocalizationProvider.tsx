import React, { useContext, useMemo } from "react";
import { LocalizationService } from "./LocalizationService";
import type { Labels } from "./types";

export const LocalizationContext = React.createContext(new LocalizationService());

export interface ILocalizationProviderProps {
    /** Anything left out keeps the outer provider's string or its default. */
    labels: Labels;
    children: React.ReactNode;
}

/** Provides the strings of every component and control runtime mounted below it. */
export const LocalizationProvider = (props: ILocalizationProviderProps) => {
    const parent = useContext(LocalizationContext);
    const localization = useMemo(() => parent.merge(props.labels), [parent, props.labels]);
    return <LocalizationContext.Provider value={localization}>{props.children}</LocalizationContext.Provider>;
};
