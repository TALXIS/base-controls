import * as React from "react";
import { FormLayoutContext } from "./FormLayoutContext";
import { RowsContext } from "./RowsContext";
import { useSectionsContext } from "./SectionsContext";
import { useFormInstance } from "./form/useFormInstance";
import { useFormUiState } from "./form/useFormUiState";

export interface IFormSectionProps {
    id?: string;
    name?: string;
    label?: React.ReactNode;
    tabName?: string;
    showLabel?: boolean;
    visible?: boolean;
    className?: string;
    style?: React.CSSProperties;
    columns?: number;
    labelWidth?: number;
    cellLabelAlignment?: "Center" | "Left" | "Right";
    cellLabelPosition?: "Top" | "Left";
    rowHeight?: number;
    children?: React.ReactNode;
}

export const Section: React.FC<IFormSectionProps> = ({
    id,
    name,
    label,
    tabName,
    showLabel = true,
    visible = true,
    className,
    style,
    columns,
    labelWidth,
    cellLabelAlignment,
    cellLabelPosition,
    rowHeight,
    children,
}) => {
    useSectionsContext();

    const form = useFormInstance();
    const layout = React.useContext(FormLayoutContext);
    useFormUiState();

    if (visible === false) {
        return null;
    }

    const resolvedTabName = tabName ?? layout.tabName ?? "";
    if (resolvedTabName && name && form.getSectionVisible(resolvedTabName, name) === false) {
        return null;
    }

    const nextLayout = React.useMemo(() => ({
        ...layout,
        tabName: resolvedTabName,
        sectionColumns: columns ?? layout.sectionColumns,
        labelWidth: labelWidth ?? layout.labelWidth,
        cellLabelAlignment: cellLabelAlignment ?? layout.cellLabelAlignment,
        cellLabelPosition: cellLabelPosition ?? layout.cellLabelPosition,
        rowHeight: rowHeight ?? layout.rowHeight,
    }), [
        cellLabelAlignment,
        cellLabelPosition,
        columns,
        labelWidth,
        layout,
        resolvedTabName,
        rowHeight,
    ]);

    return (
        <FormLayoutContext.Provider value={nextLayout}>
            <RowsContext.Provider value={true}>
                <div data-id={`section-${name ?? id ?? ""}`} className={className} style={style}>
                    {showLabel && label && (
                        <h4 data-id={`section-label-${name ?? id ?? ""}`}>{label}</h4>
                    )}
                    {children}
                </div>
            </RowsContext.Provider>
        </FormLayoutContext.Provider>
    );
};
