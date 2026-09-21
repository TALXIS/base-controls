import { Grid } from "../../../../namespace";
import { ICellRendererProps } from "../../../../components/cells/cell-renderer/CellRenderer";
import { useGridService } from "../../../../useGridService";
import { GroupedRowCell } from "../grouped-row-cell/GroupedRowCell";

/** What a column the rows are grouped by draws in its cells. */
export const GroupCell = (props: ICellRendererProps) => {
    //this cell belongs to a column the grouping module grouped, so the module is there
    const grouping = useGridService('grouping')!;

    //a record of its own carries no group: what it holds in this column is the group row's to draw
    if (!grouping.isGroupRow(props.node)) {
        return <Grid.Cell.EmptyRenderer {...props} />;
    }

    return <GroupedRowCell {...props} />;
};
