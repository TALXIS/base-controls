import { useEventEmitter } from "../../../../../../../hooks";
import { Cell, Field } from "../../../../../components"
import { ICell } from "../../../Form";
import { useRerender } from "@talxis/react-components";

export const XrmCell = ({ cell }: { cell: ICell }) => {
    const rerender = useRerender();
    useEventEmitter(cell.events, ['onLabelSet'], rerender);

    return <Field name={cell.control?.datafieldname}>
        <Cell
            colspan={cell.colspan}
            rowspan={cell.rowspan}
            label={cell.getLabel() ?? undefined} />
    </Field>

}