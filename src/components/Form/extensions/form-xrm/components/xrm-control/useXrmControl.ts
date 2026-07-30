import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks";
import { IFormXmlControl } from "@components/Form/extensions/form-xrm/internal/form-xml-form";

export const useXrmControl = (control: IFormXmlControl) => {
    const rerender = useRerender();
    useEventEmitter(control.events, ['onDisabledChanged'], rerender);

    return control;
}