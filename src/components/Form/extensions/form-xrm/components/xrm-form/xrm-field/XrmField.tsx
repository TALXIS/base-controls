import { Field } from "../../../../../components";
import { IFormXmlControl } from "../../../FormXmlForm";
import { useXrmAttribute } from "./useXrmAttribute";

interface IXrmFieldProps {
    children?: React.ReactNode;
    control?: IFormXmlControl;
    //has to be like this so children rerenders when field event emitter toggles
    onRenderChildren?: () => React.ReactNode;
}

export const XrmField = (props: IXrmFieldProps) => {
    const { onRenderChildren } = props;
    const datafieldname = props.control?.datafieldname;
    const attribute = useXrmAttribute(props.control?.datafieldname);
    const validation = attribute?.getValidation();
    const requiredLevel = attribute?.getRequiredLevel();

    return <Field name={datafieldname} validation={validation} requiredLevel={requiredLevel}>
        {onRenderChildren?.()}
    </Field>
}