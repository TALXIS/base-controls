import { useRerender } from "@talxis/react-components";
import { useFormContext } from "../form/context";
import { useEventEmitter } from "../../../../hooks";
import { IField } from "@talxis/client-libraries";

export const useField = (name?: string | null): IField | null => {
    const form = useFormContext();
    const field = name ? form.getField(name) : null;
    const _rerender = useRerender();

    const rerender = () => {
        if(field) _rerender();
    }

    const rerenderOnFieldValueChanged = (fieldName: string) => {
        if(field && field.getColumn().name === fieldName) {
            rerender();
        }
    }

    useEventEmitter(form.events, 'onAfterSave', rerender);
    useEventEmitter(form.events, 'onFieldValueChanged', rerenderOnFieldValueChanged);

    return name ? form.getField(name) : null;
    
}