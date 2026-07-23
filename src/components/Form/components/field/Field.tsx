import { FieldContext } from "./context";

interface IFieldProps {
    name?: string;
    children?: React.ReactNode;
}

export const Field = (props: IFieldProps) => {
    const { name, children } = props;

    return <FieldContext.Provider value={name ?? null}>
        {children}
    </FieldContext.Provider>
}
