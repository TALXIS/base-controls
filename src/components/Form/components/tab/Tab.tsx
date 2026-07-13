import * as React from "react";
import { PivotItem, Text, useTheme } from "@fluentui/react";
import { useTabsContext } from "../tabs";
import { TabContext } from "./context";
import { getTabStyles } from "./styles";
import { useFormInstance } from "../../form/useFormInstance";
import { useFormUiState } from "../../form/useFormUiState";
import type { IFormTabProps } from "../../form/FormModel";
import { useFormComponent } from "../../form/useFormComponent";

export type { IFormTabProps } from "../../form/FormModel";


export const Tab = (props: IFormTabProps) => {
    const tab = useFormComponent('Tab', props);
    const { children } = props;
    return <TabContext.Provider value={tab}>
        {children}
    </TabContext.Provider>
}


export const Tab2 = (props: IFormTabProps) => {
    const tabs = useTabsContext();
    const theme = useTheme();

    const form = useFormInstance();
    useFormUiState();
    const {
        id,
        name,
        showLabel = true,
        visible = true,
        label,
        children,
    } = props;

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
        <TabContext.Provider value={props}>
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
