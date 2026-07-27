import { Cell } from "../../../../../components"
import { Control } from "../../../../../components/control";
import { IFormXmlCell } from "../../../FormXmlForm";
import { useCell } from "./useCell";

export const XrmCell = ({ cell }: { cell: IFormXmlCell }) => {
    cell = useCell(cell);

    return <Cell
        colspan={cell.colspan}
        rowspan={cell.rowspan}
        disabled={cell.getDisabled()}
        label={cell.getLabel() ?? undefined}>
        <Control />
    </Cell>

}