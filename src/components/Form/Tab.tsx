import * as React from "react";
import { FormLayoutContext } from "./FormLayoutContext";
import { ColumnsContext } from "./ColumnsContext";
import { useTabsContext } from "./TabsContext";
import { useFormInstance } from "./form/useFormInstance";
import { useFormUiState } from "./form/useFormUiState";

export interface IFormTabProps {
    id?: string;
    name?: string;
    label?: React.ReactNode;
    showLabel?: boolean;
    visible?: boolean;
    panelId?: string;
    triggerId?: string;
    children?: React.ReactNode;
}

export const Tab: React.FC<IFormTabProps> = ({
    id,
    name,
    label,
    showLabel = true,
    visible = true,
    panelId,
    triggerId,
    children,
}) => {
    useTabsContext();

    const form = useFormInstance();
    useFormUiState();

    if (visible === false) {
        return null;
    }

    if (name && form.getTabVisible(name) === false) {
        return null;
    }

    return (
        <FormLayoutContext.Provider value={{ tabName: name ?? "" }}>
            <ColumnsContext.Provider value={true}>
                <div
                    data-id={`tab-${name ?? id ?? ""}`}
                    id={panelId}
                    role="tabpanel"
                    aria-labelledby={triggerId}
                >
                    {showLabel && label && (
                        <h3 data-id={`tab-label-${name ?? id ?? ""}`}>{label}</h3>
                    )}
                    {children}
                </div>
            </ColumnsContext.Provider>
        </FormLayoutContext.Provider>
    );
};
