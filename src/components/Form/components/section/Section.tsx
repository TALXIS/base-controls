import * as React from "react";
import { useSectionsContext } from "../sections";
import { SectionContext } from "./context";
import { useTabContext } from "../tab";
import { useFormInstance } from "../../form/useFormInstance";
import { useFormUiState } from "../../form/useFormUiState";

export interface IFormSectionProps {
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
    availableForPhone?: boolean;
    cellLabelAlignment?: "Center" | "Left" | "Right";
    cellLabelPosition?: "Top" | "Left";
    rowHeight?: number;
    label?: React.ReactNode;
    children?: React.ReactNode;
}

export const Section: React.FC<IFormSectionProps> = ({
    id,
    name,
    group,
    showLabel = true,
    labelId,
    showBar,
    isUserDefined,
    height,
    lockLevel,
    layout,
    addedBy,
    visible = true,
    autoExpand,
    columns,
    labelWidth,
    availableForPhone,
    cellLabelAlignment,
    cellLabelPosition,
    rowHeight,
    label,
    children,
}) => {
    useSectionsContext();

    const form = useFormInstance();
    const tab = useTabContext();
    useFormUiState();

    if (visible === false) {
        return null;
    }

    const resolvedTabName = tab.name ?? "";
    if (resolvedTabName && name && form.getSectionVisible(resolvedTabName, name) === false) {
        return null;
    }

    const nextLayout = React.useMemo(() => ({
        id,
        name,
        group,
        showLabel,
        labelId,
        showBar,
        isUserDefined,
        height,
        lockLevel,
        layout,
        addedBy,
        visible,
        autoExpand,
        sectionColumns: columns,
        labelWidth,
        availableForPhone,
        cellLabelAlignment,
        cellLabelPosition,
        rowHeight,
    }), [
        addedBy,
        autoExpand,
        availableForPhone,
        cellLabelAlignment,
        cellLabelPosition,
        columns,
        group,
        height,
        id,
        isUserDefined,
        labelId,
        labelWidth,
        layout,
        lockLevel,
        name,
        rowHeight,
        showBar,
        showLabel,
        visible,
    ]);

    return (
        <SectionContext.Provider value={nextLayout}>
            <div data-id={`section-${name ?? id ?? ""}`}>
                {showLabel && label && (
                    <h4 data-id={`section-label-${name ?? id ?? ""}`}>{label}</h4>
                )}
                {children}
            </div>
        </SectionContext.Provider>
    );
};
