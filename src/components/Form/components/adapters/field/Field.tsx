import { RequiredLevelEnum } from "@talxis/client-metadata";
import { FieldContext } from "./context";
import { IFieldValidationResult } from "@talxis/client-libraries";

export interface IFieldProps {
    name?: string;
    requiredLevel?: RequiredLevelEnum | null;
    validation?: IFieldValidationResult | null;
    children?: React.ReactNode;
}

export const Field = (props: IFieldProps) => {
    const { name, children } = props;

    return <FieldContext.Provider value={name ?? null}>
        {children}
    </FieldContext.Provider>
}
