import * as React from "react";
import type { FormXmlSection } from "@talxis/client-metadata";
import { Rows, Section } from "../../components";
import { useFormInstance } from "../useFormInstance";
import { FormRow } from "./FormRow";

export interface IFormSectionProps {
    section: FormXmlSection;
}

export const FormSection: React.FC<IFormSectionProps> = ({ section }) => {
    const form = useFormInstance();
    const sectionLabel = form.resolveLocalizedLabel(section.labels, section.name ?? "");

    return (
        <Section
            id={section.id}
            name={section.name}
            group={section.group}
            label={sectionLabel}
            showLabel={section.showlabel !== false}
            labelId={section.labelid}
            showBar={section.showbar}
            isUserDefined={section.IsUserDefined}
            height={section.height}
            lockLevel={section.locklevel}
            layout={section.layout}
            addedBy={section.addedby}
            visible={section.visible !== false}
            autoExpand={section.autoexpand}
            columns={section.columns}
            labelWidth={section.labelwidth}
            availableForPhone={section.availableforphone}
            cellLabelAlignment={section.celllabelalignment}
            cellLabelPosition={section.celllabelposition}
            rowHeight={section.rowheight}
        >
            <Rows>
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
