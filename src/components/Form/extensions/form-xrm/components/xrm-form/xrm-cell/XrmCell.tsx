import { useEventEmitter } from "../../../../../../../hooks";
import { Cell, Field } from "../../../../../components"
import { Control } from "../../../../../components/control";
import { IFormXmlCell } from "../../../FormXmlForm";
import { useRerender } from "@talxis/react-components";

export const XrmCell = ({ cell }: { cell: IFormXmlCell }) => {
    const rerender = useRerender();
    useEventEmitter(cell.events, ['onLabelChanged', 'onDisabledChanged'], rerender);

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