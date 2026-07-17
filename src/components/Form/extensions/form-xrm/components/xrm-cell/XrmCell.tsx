import { Cell } from "../../../../components";
import { ICell } from "../../Form";

export const XrmCell = ({ cell }: { cell: ICell }) => {
    
    return <Cell label={cell.getLocalizedLabel() ?? undefined}>

    </Cell>
}