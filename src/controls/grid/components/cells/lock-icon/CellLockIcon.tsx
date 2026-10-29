import { useGridInternalService } from "../../../useGridService";
import { useLabels } from "@utils";
import { GRID_LABELS } from "../../../labels";
import { useGridCell } from "../root/context";
import { CellUi, ICellUiLockIconComponents } from "../ui";

export interface ICellLockIconProps {
    components?: Partial<ICellUiLockIconComponents>;
}

/** What says a cell is locked for its record, where its column is not. */
export const CellLockIcon = (props: ICellLockIconProps) => {
    const cell = useGridCell();
    const locks = useGridInternalService('grid').modules.find('editing')?.locks;
    const labels = useLabels(GRID_LABELS);

    //a locked column is marked in its header, a locked record by its muted row
    if (locks?.get({ record: cell.getRecord(), columnName: cell.getColumnName() }).lockedBy !== 'cell') {
        return null;
    }
    return <CellUi.LockIcon message={labels.get('grid.valueLocked')} alignment={cell.getAlignment()} components={props.components} />;
};
