import { useRerender } from "@talxis/react-components";
import { IFormXmlAttribute } from "../../FormXmlForm";
import { useFormXmlContext } from "../context";
import { useEventEmitter } from "../../../../../../hooks";

export const useXrmAttribute = (name?: string): IFormXmlAttribute | null => {
    if(!name) return null;
    const formXmlModel = useFormXmlContext();
    const attribute = formXmlModel.getAttribute(name);
    const rerender = useRerender();

    useEventEmitter(attribute!.events, ['onValidationChanged', 'onRequiredLevelChanged'], rerender);

    return attribute;
}