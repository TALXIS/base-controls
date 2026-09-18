import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks";
import { IFormXmlControl } from "@controls/form/extensions/xrm-form/internal/form-xml-form";

export const useXrmControl = (control: IFormXmlControl) => {
    const rerender = useRerender();
    useEventEmitter(control.events, ['onDisabledChanged'], rerender);

    return control;
}