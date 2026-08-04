import { useRerender } from "@legacy";
import { IFormXmlAttribute } from "@components/Form/extensions/xrm-form/internal/form-xml-form";
import { useFormXmlContext } from "../context";
import { useEventEmitter } from "@hooks";

export const useXrmAttribute = (name?: string): IFormXmlAttribute | null => {
    const formXmlModel = useFormXmlContext();
    const attribute = name ? formXmlModel.getAttribute(name) : null;
    const rerender = useRerender();

    useEventEmitter(attribute?.events, ['onValidationChanged', 'onRequiredLevelChanged'], rerender);

    return attribute;
}