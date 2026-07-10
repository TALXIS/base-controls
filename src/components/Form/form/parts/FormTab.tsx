import * as React from "react";
import type { FormXmlTab } from "@talxis/client-metadata";
import { Tab } from "../../Tab";
import { Columns } from "../../Columns";
import { useFormInstance } from "../useFormInstance";
import { FormColumn } from "./FormColumn";

export interface IFormTabProps {
    tab: FormXmlTab;
}

export const FormTab: React.FC<IFormTabProps> = ({ tab }) => {
    const form = useFormInstance();
    const tabLabel = form.resolveLocalizedLabel(tab.labels, tab.name ?? "");

    return (
        <Tab
            id={tab.id}
            name={tab.name}
            label={tabLabel}
            showLabel={tab.showlabel !== false}
            visible={tab.visible !== false}
        >
            <Columns itemWidths={(tab.columns?.column ?? []).map((column) => column.width)}>
                {(tab.columns?.column ?? []).map((column, columnIndex) => (
                    <FormColumn
                        key={`tab-column-${columnIndex}`}
                        column={column}
                        tabName={tab.name ?? ""}
                        columnIndex={columnIndex}
                    />
                ))}
            </Columns>
        </Tab>
    );
};
