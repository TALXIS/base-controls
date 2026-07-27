import { useRerender } from "@talxis/react-components";
import { useEventEmitter } from "../../../../../../../hooks";
import { IFormXmlSection } from "../../../FormXmlForm";

export const useSection = (section: IFormXmlSection) => {
    const rerender = useRerender();
    useEventEmitter(section.events, ['onCellVisibilityChanged', 'onLabelChanged'], rerender);

    return section;
}