import { RequiredLevelEnum } from "@talxis/client-metadata";
import { FieldContext } from "./context";
import { IFieldValidationResult } from "@talxis/client-libraries";
import { useFormContext } from "../form/context";

interface IFieldProps {
    name?: string;
    disabled?: boolean;
    requiredLevel?: RequiredLevelEnum | null;
    validation?: IFieldValidationResult | null;
    children?: React.ReactNode;
}

export const Field = (props: IFieldProps) => {
    const form = useFormContext();
    const { name, children, requiredLevel, validation } = props;

    if(name) {
        if(requiredLevel != null) {
            form.setFieldRequiredLevel(name, requiredLevel);
        }
        if(validation != null) {
            form.setFieldValid(name, validation);
        }
    }

    return <FieldContext.Provider value={name ?? null}>
        {children}
    </FieldContext.Provider>
}
