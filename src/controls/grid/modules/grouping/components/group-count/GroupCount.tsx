import * as React from "react";
import { useGridCell } from "../../../../components/cells/root/context";
import { useGridService } from "../../../../useGridService";
import { getGroupCountStyles } from "./styles";

/** How many records the group holds, after what it is grouped by. */
export const GroupCount = () => {
    const cell = useGridCell();
    //the grouping module is registered wherever this cell draws
    const grouping = useGridService('grouping')!;
    const styles = React.useMemo(() => getGroupCountStyles(cell.getAlignment()), [cell]);
    const count = grouping.getGroupedCount(cell.getRecord(), cell.getColumnName());

    if (count === undefined) {
        return null;
    }

    return <span className={styles.count}>({count})</span>;
};
