import * as React from "react";
import { ISectionProps } from "./Section";

export const SectionContext = React.createContext<ISectionProps | null>(null);

export const useSectionContext = (): ISectionProps | null => {
    return React.useContext(SectionContext);
};
