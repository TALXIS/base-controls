import { useEventEmitter } from "../../../../../../../hooks";
import { Cell } from "../../../../../components"
import { ICell } from "../../../Form";
import { useRerender } from "@talxis/react-components";

export const XrmCell = ({ cell }: { cell: ICell }) => {
    const rerender = useRerender();
    useEventEmitter(cell.events, ['onSetDisabled', 'onLabelSet'], rerender);
    
    return <Cell colspan={cell.colspan} rowspan={cell.rowspan} label={cell.getLabel() ?? undefined} disabled={cell.getDisabled()}>

    </Cell>
}