import { useRerender, useEventEmitter } from "@core";
import { IFormXmlCell } from "../../runtime/form-xml-form";

export const useCell = (cell: IFormXmlCell) => {
    const { rerender } = useRerender();
    useEventEmitter(cell.events, ['onLabelChanged'], rerender);

    return cell;
}