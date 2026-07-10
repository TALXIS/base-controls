import * as React from "react";
import { Text, useTheme } from "@fluentui/react";
import { useTabsContext } from "../tabs";
import { TabContext } from "./context";
import { getTabStyles } from "./styles";
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
    const theme = useTheme();

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
    const styles = getTabStyles(theme);

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
                className={styles.panel}
                data-id={`tab-${name ?? id ?? ""}`}
                id={`${tabId}-panel`}
                role="tabpanel"
                aria-labelledby={`${tabId}-trigger`}
            >
                {showLabel && label && (
                    <Text variant="xLarge" className={styles.heading} data-id={`tab-label-${name ?? id ?? ""}`} block>
                        {label}
                    </Text>
                )}
                {children}
            </div>
        </TabContext.Provider>
    );
};
