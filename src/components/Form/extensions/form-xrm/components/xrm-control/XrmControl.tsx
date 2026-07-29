import { IFormXmlControl } from "../../FormXmlForm"
import { Form } from "../../../../components";
import { useXrmControl } from "./useXrmControl";

export const XrmControl = (props: {control: IFormXmlControl}) => {
    const control = useXrmControl(props.control);

    return <Form.Control disabled={control.getDisabled()}  />
}