import * as React from "react";
import type { IFormV2UiSectionBodyProps } from "./SectionBody";

export interface IFormV2UiSectionBodyContext extends Pick<IFormV2UiSectionBodyProps, 'labelWidth' | 'cellLabelPosition' | 'cellLabelCollapseBreakpoint'> {
    columnsPerRow: number;
    containerWidth: number;
}

export const FormV2UiSectionBodyContext = React.createContext<IFormV2UiSectionBodyContext | null>(null);

export const useFormV2UiSectionBodyContext = (): IFormV2UiSectionBodyContext | null => {
    return React.useContext(FormV2UiSectionBodyContext);
};
