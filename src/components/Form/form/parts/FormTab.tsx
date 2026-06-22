import * as React from "react";
import { Tab } from "../../Tab";
import { useFormInstance } from "../useFormInstance";
import { FormColumn } from "./FormColumn";

/**
 * Renders the currently-active tab. MVP: always the first tab.
 */
export const FormTab: React.FC = () => {
    const form = useFormInstance();

    const tab = form.getActiveTab();
    if (!tab) {
        return null;
    }

    const tabLabel = form.resolveLocalizedLabel(tab.labels, tab.name ?? "");

    return (
        <Tab
            id={tab.id}
            name={tab.name}
            label={tabLabel}
            showLabel={tab.showlabel !== false}
        >
            {(tab.columns?.column ?? []).map((column, columnIndex) => (
                <FormColumn
                    key={columnIndex}
                    column={column}
                    tabName={tab.name ?? ""}
                    columnIndex={columnIndex}
                />
            ))}
        </Tab>
    );
};
