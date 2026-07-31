import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks";
import { IFormXmlSection } from "@components/Form/extensions/xrm-form/internal/form-xml-form";

export const useSection = (section: IFormXmlSection) => {
    const rerender = useRerender();
    useEventEmitter(section.events, ['onCellVisibilityChanged', 'onLabelChanged'], rerender);

    return section;
}