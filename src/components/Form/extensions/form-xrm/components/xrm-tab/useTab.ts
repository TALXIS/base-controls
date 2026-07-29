import { useRerender } from "../../../../../../legacy/react-components";
import { useEventEmitter } from "../../../../../../hooks";
import { IFormXmlTab } from "../../internal/FormXmlForm";

export const useTab = (tab: IFormXmlTab) => {
    const rerender = useRerender();
    useEventEmitter(tab.events, ['onSectionVisibilityChanged', 'onLabelChanged'], rerender);

    return tab;
}