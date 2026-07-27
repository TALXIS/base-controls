import { Section } from "../../../../../components";
import { IFormXmlSection } from "../../../FormXmlForm";
import { XrmCell } from "../xrm-cell/XrmCell";
import { useSection } from "./useSection";

export interface IXrmSectionProps {
    section: IFormXmlSection;
}

export const XrmSection = (props: IXrmSectionProps) => {
    const section = useSection(props.section);

    return <Section
        cellLabelPosition={section.getCellLabelPosition()}
        showLabel={section.showlabel}
        labelWidth={section.labelwidth}
        label={section.getLabel() ?? undefined}
    >
        {section.getVisibleCells().map((cell, index) => {
            return <XrmCell key={cell.id ?? index} cell={cell} />
        })}
    </Section>;
};