import { RequiredLevelEnum } from "@talxis/client-metadata";
import { useFormContext } from "../form/context";
import { FieldContext } from "./context";
import { IFieldValidationResult, IRecordEvents } from "@talxis/client-libraries";
import { useEventEmitter } from "../../../../hooks";
import { useRerender } from "@talxis/react-components";

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
    const record = form.getRecord();
    const field = form.getField(name);
    const column = field.getColumn();
    const rerender = useRerender();

    useEventEmitter<IRecordEvents>(record, 'onAfterSaved', rerender)

    useEventEmitter<IRecordEvents>(record, 'onFieldValueChanged', (columnName: string) => {
        if (columnName === column.name) {
            rerender();
        }
    });

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
