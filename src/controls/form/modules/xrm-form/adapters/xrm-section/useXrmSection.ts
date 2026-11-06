import { useRerender, useEventEmitter } from "@core";
import { IFormXmlSection } from "../../runtime/form-xml-form";

export const useXrmSection = (section: IFormXmlSection) => {
    const { rerender } = useRerender();
    useEventEmitter(section.events, ['onCellVisibilityChanged', 'onLabelChanged'], rerender);

    return section;
}