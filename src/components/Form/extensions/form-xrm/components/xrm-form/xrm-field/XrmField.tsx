import { Field } from "../../../../../components";
import { IFormXmlControl } from "../../../FormXmlForm";

interface IXrmFieldProps {
    children?: React.ReactNode;
    control?: IFormXmlControl;
}

export const XrmField = (props: IXrmFieldProps) => {
    const { children, control } = props;
    const validation = control?.getValidation();

    return <Field name={control?.datafieldname} validation={validation}>
        {children}
    </Field>
}