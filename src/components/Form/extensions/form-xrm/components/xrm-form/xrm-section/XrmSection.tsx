import { useRerender } from "@talxis/react-components";
import { Section } from "../../../../../components";
import { IFormXmlSection } from "../../../FormXmlForm";
import { XrmCell } from "../xrm-cell/XrmCell";
import { useEventEmitter } from "../../../../../../../hooks";

export interface IXrmSectionProps {
    section: IFormXmlSection;
}

export const XrmSection = (props: IXrmSectionProps) => {
    const { section } = props;
    const rerender = useRerender();
    useEventEmitter(section.events, ['onCellVisibilityChanged', 'onLabelChanged'], rerender);

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