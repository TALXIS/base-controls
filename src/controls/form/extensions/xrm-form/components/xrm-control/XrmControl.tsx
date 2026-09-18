import { IFormXmlControl } from "@controls/form/extensions/xrm-form/internal/form-xml-form";
import { Form } from "@controls/form/components/Form";
import { useXrmControl } from "./useXrmControl";
import { useXrmFormComponents } from "../xrm-form/context";

export const XrmControl = (props: {control: IFormXmlControl}) => {
    const control = useXrmControl(props.control);
    const components = useXrmFormComponents();

    return <Form.Control 
        id={control.id}
        disabled={control.getDisabled()} 
        components={components?.control} />
}