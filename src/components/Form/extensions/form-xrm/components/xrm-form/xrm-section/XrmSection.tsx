import { Section } from "../../../../../components";
import { ISection } from "../../../Form";
import { XrmCell } from "../xrm-cell/XrmCell";

export interface IXrmSectionProps {
    section: ISection;
}

export const XrmSection = (props: IXrmSectionProps) => {
    const { section } = props;

    return <Section
        cellLabelPosition={section.getCellLabelPosition()}
        showLabel={section.showlabel}
        labelWidth={section.labelwidth}
        label={section.getLocalizedLabel() ?? undefined}
    >
        {section.getVisibleCells().map((cell, index) => <XrmCell key={cell.id ?? index} cell={cell} />)}
    </Section>;
};