import { useRerender } from "@legacy";
import { useForm } from "../root/context";
import { useEventEmitter } from "@hooks";
import { IField } from "@talxis/client-libraries";
import { useFieldName } from "./context";

export const useField = (name?: string | null): IField | null => {
    const form = useForm();
    const contextFieldName = useFieldName();
    name = name ?? contextFieldName;
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