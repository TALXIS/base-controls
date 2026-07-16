import * as React from "react";
import { ISectionProps } from "./Section";

interface ISectionContext extends ISectionProps {
    columnsPerRow: number;
}

export const SectionContext = React.createContext<ISectionContext | null>(null);

export const useSectionContext = (): ISectionContext | null => {
    return React.useContext(SectionContext);
};
