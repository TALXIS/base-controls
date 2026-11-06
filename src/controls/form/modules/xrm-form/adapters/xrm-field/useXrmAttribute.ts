import { useRerender, useEventEmitter } from "@core";
import { IFormXmlAttribute } from "../../runtime/form-xml-form";
import { useFormXmlModel } from "../context";

export const useXrmAttribute = (name?: string): IFormXmlAttribute | null => {
    const formXmlModel = useFormXmlModel();
    const attribute = name ? formXmlModel.getAttribute(name) : null;
    const { rerender } = useRerender();

    useEventEmitter(attribute?.events, ['onValidationChanged', 'onRequiredLevelChanged'], rerender);

    return attribute;
}