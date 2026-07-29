import { useRerender } from "@talxis/react-components";
import { useEventEmitter } from "../../../../../../hooks";
import { IFormXmlControl } from "../../internal/FormXmlForm";

export const useXrmControl = (control: IFormXmlControl) => {
    const rerender = useRerender();
    useEventEmitter(control.events, ['onDisabledChanged'], rerender);

    return control;
}