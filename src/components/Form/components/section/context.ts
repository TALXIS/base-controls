import * as React from "react";

export interface ISectionContextValue {
    id?: string;
    name?: string;
    group?: string;
    showLabel?: boolean;
    labelId?: string;
    showBar?: boolean;
    isUserDefined?: string;
    height?: string;
    lockLevel?: number;
    layout?: string;
    addedBy?: string;
    visible?: boolean;
    autoExpand?: boolean;
    columns?: number;
    labelWidth?: number;
    cellLabelTopBreakpoint?: number;
    availableForPhone?: boolean;
    cellLabelAlignment?: "Center" | "Left" | "Right";
    cellLabelPosition?: "Top" | "Left";
    rowHeight?: number;
}

export const SectionContext = React.createContext<ISectionContextValue | null>(null);

export const useSectionContext = (): ISectionContextValue => {
    const context = React.useContext(SectionContext);
    if (context === null) {
        throw new Error("[Form] Row and Cell must be rendered inside Section.");
    }

    return context;
};
