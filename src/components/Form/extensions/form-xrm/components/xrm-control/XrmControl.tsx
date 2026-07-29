import { IFormXmlControl } from "../../internal/FormXmlForm"
import { Form } from "../../../../components/Form";
import { useXrmControl } from "./useXrmControl";

export const XrmControl = (props: {control: IFormXmlControl}) => {
    const control = useXrmControl(props.control);

    return <Form.Control disabled={control.getDisabled()}  />
}