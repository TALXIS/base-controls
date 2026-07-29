import { useRerender } from "../../../../../../legacy/react-components";
import { useEventEmitter } from "../../../../../../hooks";
import { IFormXmlSection } from "../../internal/FormXmlForm";

export const useSection = (section: IFormXmlSection) => {
    const rerender = useRerender();
    useEventEmitter(section.events, ['onCellVisibilityChanged', 'onLabelChanged'], rerender);

    return section;
}