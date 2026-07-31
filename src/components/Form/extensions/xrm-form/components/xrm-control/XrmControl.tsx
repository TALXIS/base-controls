import { IFormXmlControl } from "@components/Form/extensions/xrm-form/internal/form-xml-form";
import { Form } from "@components/Form/components/Form";
import { useXrmControl } from "./useXrmControl";

export const XrmControl = (props: {control: IFormXmlControl}) => {
    const control = useXrmControl(props.control);

    return <Form.Control disabled={control.getDisabled()}  />
}