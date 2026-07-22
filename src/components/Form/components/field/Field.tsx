import { useFormContext } from "../form/context";
import { FieldContext } from "./context";
import { IRecordEvents } from "@talxis/client-libraries";
import { useEventEmitter } from "../../../../hooks";
import { useRerender } from "@talxis/react-components";

interface IFieldProps {
    name: string;
    disabled?: boolean;
    children?: React.ReactNode;
}

export const Field = (props: IFieldProps) => {
    const { name, children, disabled } = props;
    const form = useFormContext();
    const record = form.getRecord();
    const field = form.getField(name);
    const column = field.getColumn();
    const rerender = useRerender();

    useEventEmitter(form.events, 'onAfterSave', rerender);

    useEventEmitter<IRecordEvents>(record, 'onFieldValueChanged', (columnName: string) => {
        if (columnName === column.name) {
            rerender();
        }
    });

    if (disabled !== undefined) {
        form.setFieldDisabled(name, disabled);
    }


    return <FieldContext.Provider value={field}>
        {children}
    </FieldContext.Provider>
}
