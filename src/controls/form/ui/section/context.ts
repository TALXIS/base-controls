import * as React from "react";
import { IFormUiSectionProps } from "./Section";

export interface ISectionContext extends IFormUiSectionProps {
    columnsPerRow: number;
    containerWidth: number;
}

export const SectionContext = React.createContext<ISectionContext | null>(null);

export const useSectionContext = (): ISectionContext | null => {
    return React.useContext(SectionContext);
};
