import * as React from "react";
import { useTabsContext } from "../tabs";
import { TabContext } from "./context";
import { useFormInstance } from "../../form/useFormInstance";
import { useFormUiState } from "../../form/useFormUiState";

export interface IFormTabProps {
    id?: string;
    name?: string;
    group?: string;
    verticalLayout?: boolean;
    showLabel?: boolean;
    labelId?: string;
    isUserDefined?: string;
    lockLevel?: number;
    addedBy?: string;
    expanded?: boolean;
    visible?: boolean;
    availableForPhone?: boolean;
    collapsible?: boolean;
    label?: React.ReactNode;
    children?: React.ReactNode;
}

export const Tab: React.FC<IFormTabProps> = ({
    id,
    name,
    group,
    verticalLayout,
    showLabel = true,
    labelId,
    isUserDefined,
    lockLevel,
    addedBy,
    expanded,
    visible = true,
    availableForPhone,
    collapsible,
    label,
    children,
}) => {
    const tabs = useTabsContext();

    const form = useFormInstance();
    useFormUiState();

    if (visible === false) {
        return null;
    }

    if (name && form.getTabVisible(name) === false) {
        return null;
    }

    const isSelected = (tabs.activeTabName && name)
        ? tabs.activeTabName === name
        : tabs.activeTabId === id;

    if (!isSelected) {
        return null;
    }

    const tabId = id ?? name ?? "active-tab";

    return (
        <TabContext.Provider
            value={{
                id,
                name,
                group,
                verticalLayout,
                showLabel,
                labelId,
                isUserDefined,
                lockLevel,
                addedBy,
                expanded,
                visible,
                availableForPhone,
                collapsible,
            }}
        >
            <div
                data-id={`tab-${name ?? id ?? ""}`}
                id={`${tabId}-panel`}
                role="tabpanel"
                aria-labelledby={`${tabId}-trigger`}
            >
                {showLabel && label && (
                    <h3 data-id={`tab-label-${name ?? id ?? ""}`}>{label}</h3>
                )}
                {children}
            </div>
        </TabContext.Provider>
    );
};
