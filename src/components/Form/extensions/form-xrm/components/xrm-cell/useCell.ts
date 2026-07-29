import { useRerender } from "@talxis/react-components";
import { useEventEmitter } from "../../../../../../hooks";
import { IFormXmlCell } from "../../internal/FormXmlForm";

export const useCell = (cell: IFormXmlCell) => {
    const rerender = useRerender();
    useEventEmitter(cell.events, ['onLabelChanged'], rerender);

    return cell;
}