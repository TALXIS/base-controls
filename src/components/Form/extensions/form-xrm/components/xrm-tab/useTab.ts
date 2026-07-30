import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks";
import { IFormXmlTab } from "@components/Form/extensions/form-xrm/internal/form-xml-form";

export const useTab = (tab: IFormXmlTab) => {
    const rerender = useRerender();
    useEventEmitter(tab.events, ['onSectionVisibilityChanged', 'onLabelChanged'], rerender);

    return tab;
}