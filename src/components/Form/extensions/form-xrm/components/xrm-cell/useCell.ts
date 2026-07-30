import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks";
import { IFormXmlCell } from "@components/Form/extensions/form-xrm/internal/form-xml-form";

export const useCell = (cell: IFormXmlCell) => {
    const rerender = useRerender();
    useEventEmitter(cell.events, ['onLabelChanged'], rerender);

    return cell;
}