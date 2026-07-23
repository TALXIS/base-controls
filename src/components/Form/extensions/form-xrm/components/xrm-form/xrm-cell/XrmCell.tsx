import { useEventEmitter } from "../../../../../../../hooks";
import { Cell, Field } from "../../../../../components"
import { Control } from "../../../../../components/control";
import { ICell } from "../../../Form";
import { useRerender } from "@talxis/react-components";

export const XrmCell = ({ cell }: { cell: ICell }) => {
    const rerender = useRerender();
    useEventEmitter(cell.events, ['onLabelSet', 'onDisabledSet'], rerender);

    return <Field name={cell.control?.datafieldname}>
        <Cell
            colspan={cell.colspan}
            rowspan={cell.rowspan}
            disabled={cell.getDisabled()}
            label={cell.getLabel() ?? undefined}>
            <Control />
        </Cell>
    </Field>

}