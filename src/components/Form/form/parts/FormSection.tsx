import * as React from "react";
import type { FormXmlSection } from "@talxis/client-metadata";
import { Section } from "../../Section";
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
        >
            {(section.rows?.row ?? []).map((row, rowIndex) => (
                <FormRow
                    key={rowIndex}
                    row={row}
                />
            ))}
        </Section>
    );
};
