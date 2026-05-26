import * as React from "react";
import type { FormXmlSection } from "@talxis/client-metadata";
import { useFormInstance } from "../useFormInstance";
import { useFormUiState } from "../useFormUiState";
import { FormRow } from "./FormRow";

export interface IFormSectionProps {
    section: FormXmlSection;
    tabName: string;
}

export const FormSection: React.FC<IFormSectionProps> = ({ section, tabName }) => {
    const form = useFormInstance();
    useFormUiState();

    if (form.getSectionVisible(tabName, section.name ?? '') === false) {
        return null;
    }

    const rows = section.rows?.row ?? [];
    const sectionLabel = form.resolveLocalizedLabel(section.labels, section.name ?? "");
    const showLabel = section.showlabel !== false;
    return (
        <div data-id={`section-${section.name ?? section.id ?? ''}`}>
            {showLabel && sectionLabel && (
                <h4 data-id={`section-label-${section.name ?? section.id ?? ''}`}>{sectionLabel}</h4>
            )}
            {rows.map((row: any, rowIndex: number) => (
                <FormRow key={rowIndex} row={row} />
            ))}
        </div>
    );
};
