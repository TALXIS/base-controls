import { IFormXmlControl } from "../../FormXmlForm"
import { Control } from "../../../../components";
import { useXrmControl } from "./useXrmControl";

export const XrmControl = (props: {control: IFormXmlControl}) => {
    const control = useXrmControl(props.control);

    return <Control disabled={control.getDisabled()}  />
}