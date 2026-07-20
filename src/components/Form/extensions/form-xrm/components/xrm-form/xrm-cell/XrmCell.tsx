import { Cell } from "../../../../../components"
import { ICell } from "../../../Form"

export const XrmCell = ({ cell }: { cell: ICell }) => {
    
    return <Cell colspan={cell.colspan} rowspan={cell.rowspan} label={cell.getLocalizedLabel() ?? undefined}>

    </Cell>
}