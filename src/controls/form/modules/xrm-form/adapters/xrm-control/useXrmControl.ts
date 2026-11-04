import { useRerender, useEventEmitter } from "@core";
import { IFormXmlControl } from "../../runtime/form-xml-form";

export const useXrmControl = (control: IFormXmlControl) => {
    const { rerender } = useRerender();
    useEventEmitter(control.events, ['onDisabledChanged'], rerender);

    return control;
}