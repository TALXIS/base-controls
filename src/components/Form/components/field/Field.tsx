import { RequiredLevelEnum } from "@talxis/client-metadata";
import { useFormContext } from "../form/context";
import { FieldContext } from "./context";
import { IFieldValidationResult } from "@talxis/client-libraries";

interface IFieldProps {
    name: string;
    disabled?: boolean;
    requiredLevel?: RequiredLevelEnum;
    validationResult?: IFieldValidationResult;
    children?: React.ReactNode;
}

export const Field = (props: IFieldProps) => {
    const { name, children, disabled, requiredLevel, validationResult } = props;
    const form = useFormContext();
    const field = form.getField(name);

    if (disabled !== undefined) {
        form.setFieldDisabled(name, disabled);
    }
    
    if (requiredLevel !== undefined) {
        form.setFieldRequiredLevel(name, requiredLevel);
    }

    if (validationResult !== undefined) {
        form.setFieldValidationResult(name, validationResult);
    }
    

    return <FieldContext.Provider value={field}>
        {children}
    </FieldContext.Provider>
}
