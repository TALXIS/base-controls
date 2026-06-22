import * as React from "react";
import { FormLayoutContext } from "./FormLayoutContext";
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
    children,
}) => {
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

    return (
        <div data-id={`section-${name ?? id ?? ""}`} className={className}>
            {showLabel && label && (
                <h4 data-id={`section-label-${name ?? id ?? ""}`}>{label}</h4>
            )}
            {children}
        </div>
    );
};
