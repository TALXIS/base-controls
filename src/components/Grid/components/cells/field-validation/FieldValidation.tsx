import { IRecordEvents } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useRequiredGridField } from "../field/context";
import { useGridService } from "../../../useGridService";
import { FieldValidationComponents, IGridFieldValidationComponents } from "./components";

export interface IGridFieldValidationProps {
    components?: Partial<IGridFieldValidationComponents>;
}

/**
 * What a cell says about a value its record refuses, and what tells it to say it.
 *
 * Requires a field, and draws nothing while that field is valid. Owns the subscriptions on this path:
 * validity is answered on every call, so what can change the answer - a new value, or the save that judged
 * it - has to reach whatever is drawing it.
 */
export const FieldValidation = (props: IGridFieldValidationProps) => {
    const field = useRequiredGridField();
    const gridTheme = useGridService('theme');
    const record = field.getRecord();
    const components = { ...FieldValidationComponents, ...props.components };
    const rerender = useRerender();

    useEventEmitter<IRecordEvents>(record, ['onAfterSaved', 'onFieldValueChanged'], () => {
        rerender();
    });

    const { error, errorMessage } = field.isValid();
    if (!error) {
        return null;
    }
    return components.onRenderFieldError({ message: errorMessage, surfaceTheme: gridTheme });
};
