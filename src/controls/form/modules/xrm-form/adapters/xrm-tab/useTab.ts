import { useRerender, useEventEmitter } from "@core";
import { IFormXmlTab } from "../../runtime/form-xml-form";

export const useTab = (tab: IFormXmlTab) => {
    const { rerender } = useRerender();
    useEventEmitter(tab.events, ['onSectionVisibilityChanged', 'onLabelChanged'], rerender);

    return tab;
}