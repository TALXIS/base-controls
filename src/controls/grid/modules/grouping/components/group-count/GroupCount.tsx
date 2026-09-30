import { useGridCell } from "../../../../components/cells/root/context";
import { useGridService } from "../../../../useGridService";
import { GroupingUi, IGroupingUiCountComponents } from "../ui";

export interface IGroupCountProps {
    components?: Partial<IGroupingUiCountComponents>;
}

/** How many records the group holds, after what it is grouped by. */
export const GroupCount = (props: IGroupCountProps) => {
    const cell = useGridCell();
    //the grouping module is registered wherever this cell draws
    const grouping = useGridService('grouping')!;
    const count = grouping.getGroupedCount(cell.getRecord(), cell.getColumnName());

    if (count === undefined) {
        return null;
    }
    return <GroupingUi.Count count={count} alignment={cell.getAlignment()} components={props.components} />;
};
