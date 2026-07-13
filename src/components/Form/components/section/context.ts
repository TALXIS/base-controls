import * as React from "react";
import { ISection } from "../..";

export const SectionContext = React.createContext<ISection | null>(null);

export const useSectionContext = (): ISection | null => {
    return React.useContext(SectionContext);
};
