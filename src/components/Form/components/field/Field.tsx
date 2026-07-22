import { useFormContext } from "../form/context";
import { FieldContext } from "./context";

interface IFieldProps {
    name?: string;
    disabled?: boolean;
    children?: React.ReactNode;
}

export const Field = (props: IFieldProps) => {
    const { name, children, disabled } = props;
    const form = useFormContext();

    if (name && disabled !== undefined) {
        form.setFieldDisabled(name, disabled);
    }
    
    return <FieldContext.Provider value={name ?? null}>
        {children}
    </FieldContext.Provider>
}
