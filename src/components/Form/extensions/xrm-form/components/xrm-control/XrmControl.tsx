import { IFormXmlControl } from "@components/Form/extensions/xrm-form/internal/form-xml-form";
import { Form } from "@components/Form/components/Form";
import { useXrmControl } from "./useXrmControl";
import { useXrmControlComponents } from "./context";

export const XrmControl = (props: {control: IFormXmlControl}) => {
    const control = useXrmControl(props.control);
    const components = useXrmControlComponents();

    return <Form.Control 
        id={control.id}
        disabled={control.getDisabled()} 
        components={components?.control} />
}