import * as React from "react";

export interface IFormLayoutContextValue {
    tabName?: string;
    sectionColumns?: number;
    labelWidth?: number;
    cellLabelAlignment?: "Center" | "Left" | "Right";
    cellLabelPosition?: "Top" | "Left";
    rowHeight?: number;
}

export const FormLayoutContext = React.createContext<IFormLayoutContextValue>({});
