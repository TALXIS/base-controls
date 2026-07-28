import { useRerender } from "@talxis/react-components";
import { useFormContext } from "../form/context";
import { IControlProps } from "./Control";
import { useEventEmitter } from "../../../../hooks";

export const useControl = (props: IControlProps): IControlProps => {
    const form = useFormContext();
    const rerender = useRerender();

    //toggled to ensure validation message can appear
    useEventEmitter(form.events, 'onBeforeSave', rerender); 

    return props;
}