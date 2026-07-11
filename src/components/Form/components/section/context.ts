import * as React from "react";
import type { IFormSectionProps } from "./Section";

export const SectionContext = React.createContext<IFormSectionProps | null>(null);

export const useSectionContext = (): IFormSectionProps => {
    const context = React.useContext(SectionContext);
    if (context === null) {
        throw new Error("[Form] Row and Cell must be rendered inside Section.");
    }

    return context;
};
