import * as React from "react";
import type { FormXmlTab } from "@talxis/client-metadata";
import { Columns, Tab } from "../../components";
import { useFormInstance } from "../useFormInstance";
import { FormColumn } from "./FormColumn";

export interface IFormTabProps {
    tab: FormXmlTab;
}

export const FormTab = ({ tab }: IFormTabProps) => {
    const form = useFormInstance();
    const tabLabel = form.resolveLocalizedLabel(tab.labels, tab.name ?? "");

    return (
        <Tab
            id={tab.id}
            name={tab.name}
            group={tab.group}
            verticalLayout={tab.verticallayout}
            label={tabLabel}
            showLabel={tab.showlabel !== false}
            labelId={tab.labelid}
            isUserDefined={tab.IsUserDefined}
            lockLevel={tab.locklevel}
            addedBy={tab.addedby}
            expanded={tab.expanded}
            visible={tab.visible !== false}
            availableForPhone={tab.availableforphone}
            collapsible={tab.collapsible}
        >
            <Columns>
                {(tab.columns?.column ?? []).map((column, columnIndex) => (
                    <FormColumn
                        key={`tab-column-${columnIndex}`}
                        column={column}
                    />
                ))}
            </Columns>
        </Tab>
    );
};
