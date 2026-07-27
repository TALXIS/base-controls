import { Field } from "../../../../../components";
import { IFormXmlControl } from "../../../FormXmlForm";
import { useXrmAttribute } from "./useXrmAttribute";

interface IXrmFieldProps {
    children?: React.ReactNode;
    control?: IFormXmlControl;
}

export const XrmField = (props: IXrmFieldProps) => {
    const { children } = props;
    const datafieldname = props.control?.datafieldname;
    const attribute = useXrmAttribute(props.control?.datafieldname);
    const validation = attribute?.getValidation();

    return <Field name={datafieldname} validation={validation}>
        {children}
    </Field>
}