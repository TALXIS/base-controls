import type { FormXmlColumn } from "@talxis/client-metadata";
import { Column, Sections } from "../../components";
import { FormSection } from "./FormSection";

export interface IFormColumnProps {
    column: FormXmlColumn;
}

export const FormColumn = ({ column }: IFormColumnProps) => {
    const sections = column.sections?.section ?? [];

    return (
        <Column width={column.width}>
            <Sections>
                {sections.map((section, sectionIndex) => (
                    <FormSection
                        key={section.id ?? section.name ?? sectionIndex}
                        section={section}
                    />
                ))}
            </Sections>
        </Column>
    );
};
