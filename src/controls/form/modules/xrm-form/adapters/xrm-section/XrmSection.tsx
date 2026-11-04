import { Form } from "../../../../Form";
import { IFormXmlSection } from "../../runtime/form-xml-form";
import { XrmCell } from "../xrm-cell/XrmCell";
import { XrmField } from "../xrm-field";
import { useSection } from "./useSection";

export interface IXrmSectionProps {
    section: IFormXmlSection;
}

export const XrmSection = (props: IXrmSectionProps) => {
    const section = useSection(props.section);

    return <Form.Section
        id={section.id ?? section.name ?? undefined}
        cellLabelPosition={section.getCellLabelPosition()}
        showLabel={section.showlabel}
        labelWidth={section.labelwidth}
        layout={{
            lg: section.getNumberOfColumns(),
        }}
        label={section.getLabel() ?? undefined}
    >
        {section.getVisibleCells().map((cell, index) => {
            const key = cell.id ?? index;
            return <XrmField key={key} control={cell.control} onRenderChildren={() => <XrmCell key={key} cell={cell} />} />
        })}
    </Form.Section>;
};