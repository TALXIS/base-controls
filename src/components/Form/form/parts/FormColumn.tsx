import * as React from "react";
import type { FormXmlColumn } from "@talxis/client-metadata";
import { Column } from "../../Column";
import { FormSection } from "./FormSection";

export interface IFormColumnProps {
    column: FormXmlColumn;
    tabName: string;
    columnIndex: number;
}

export const FormColumn: React.FC<IFormColumnProps> = ({ column, tabName, columnIndex }) => {
    const sections = column.sections?.section ?? [];

    return (
        <Column width={column.width} columnIndex={columnIndex}>
            {sections.map((section, sectionIndex) => (
                <FormSection
                    key={section.id ?? section.name ?? sectionIndex}
                    section={section}
                    tabName={tabName}
                />
            ))}
        </Column>
    );
};
