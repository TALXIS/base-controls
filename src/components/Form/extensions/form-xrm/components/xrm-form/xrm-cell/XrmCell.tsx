import { Cell } from "../../../../../components"
import { IFormXmlCell } from "../../../FormXmlForm";
import { XrmControl } from "../xrm-control";
import { useCell } from "./useCell";

export const XrmCell = ({ cell }: { cell: IFormXmlCell }) => {
    cell = useCell(cell);

    return <Cell
        colspan={cell.colspan}
        rowspan={cell.rowspan}
        label={cell.getLabel() ?? undefined}>
        {cell.control && <XrmControl control={cell.control} />}
    </Cell>

}