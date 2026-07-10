import * as React from "react";
import type { FormXmlColumn } from "@talxis/client-metadata";
import { Column } from "../../Column";
import { Sections } from "../../Sections";
import { FormSection } from "./FormSection";

export interface IFormColumnProps {
    column: FormXmlColumn;
    tabName: string;
    columnIndex: number;
    applyWidthStyle?: boolean;
}

export const FormColumn: React.FC<IFormColumnProps> = ({ column, tabName, columnIndex, applyWidthStyle }) => {
    const sections = column.sections?.section ?? [];

    return (
        <Column width={column.width} columnIndex={columnIndex} applyWidthStyle={applyWidthStyle}>
            <Sections>
                {sections.map((section, sectionIndex) => (
                    <FormSection
                        key={section.id ?? section.name ?? sectionIndex}
                        section={section}
                        tabName={tabName}
                    />
                ))}
            </Sections>
        </Column>
    );
};
