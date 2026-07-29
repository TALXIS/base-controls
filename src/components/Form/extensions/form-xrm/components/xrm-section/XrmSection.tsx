import { Form } from "@components/Form/components/Form";
import { IFormXmlSection } from "@components/Form/extensions/form-xrm/internal/FormXmlForm";
import { XrmCell } from "../xrm-cell/XrmCell";
import { XrmField } from "../xrm-field";
import { useSection } from "./useSection";

export interface IXrmSectionProps {
    section: IFormXmlSection;
}

export const XrmSection = (props: IXrmSectionProps) => {
    const section = useSection(props.section);

    return <Form.Section
        cellLabelPosition={section.getCellLabelPosition()}
        showLabel={section.showlabel}
        labelWidth={section.labelwidth}
        layout={{
            lg: section.getNumberOfColumns(),
        }}
        label={section.getLabel() ?? undefined}
    >
        {section.getVisibleCells().map((cell, index) => {
            return <XrmField control={cell.control} onRenderChildren={() => <XrmCell key={cell.id ?? index} cell={cell} />} />
        })}
    </Form.Section>;
};