import { useRerender, useEventEmitter } from "@core";
import { IFormXmlCell } from "../../runtime/form-xml-form";

export const useXrmCell = (cell: IFormXmlCell) => {
    const { rerender } = useRerender();
    useEventEmitter(cell.events, ['onLabelChanged'], rerender);

    return cell;
}