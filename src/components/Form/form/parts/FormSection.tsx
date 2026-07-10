import * as React from "react";
import type { FormXmlSection } from "@talxis/client-metadata";
import { Section } from "../../Section";
import { Rows } from "../../Rows";
import { useFormInstance } from "../useFormInstance";
import { FormRow } from "./FormRow";

export interface IFormSectionProps {
    section: FormXmlSection;
    tabName: string;
}

export const FormSection: React.FC<IFormSectionProps> = ({ section, tabName }) => {
    const form = useFormInstance();
    const sectionLabel = form.resolveLocalizedLabel(section.labels, section.name ?? "");

    return (
        <Section
            id={section.id}
            name={section.name}
            label={sectionLabel}
            tabName={tabName}
            showLabel={section.showlabel !== false}
            visible={section.visible !== false}
            columns={section.columns}
            labelWidth={section.labelwidth}
            cellLabelAlignment={section.celllabelalignment}
            cellLabelPosition={section.celllabelposition}
            rowHeight={section.rowheight}
        >
            <Rows rowHeight={section.rowheight}>
                {(section.rows?.row ?? []).map((row, rowIndex) => (
                    <FormRow
                        key={rowIndex}
                        row={row}
                    />
                ))}
            </Rows>
        </Section>
    );
};
