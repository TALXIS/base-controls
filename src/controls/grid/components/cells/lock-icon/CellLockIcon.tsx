import { useGridService } from "../../../useGridService";
import { useGridCell } from "../root/context";
import { CellUi, ICellUiLockIconComponents } from "../ui";

export interface ICellLockIconProps {
    components?: Partial<ICellUiLockIconComponents>;
}

/** What says a cell is locked for its record, where its column is not. */
export const CellLockIcon = (props: ICellLockIconProps) => {
    const cell = useGridCell();
    const locks = useGridService('editing')?.locks;
    const labels = useGridService('labels');

    //a locked column is marked in its header, a locked record by its muted row
    if (locks?.get({ record: cell.getRecord(), columnName: cell.getColumnName() }).lockedBy !== 'cell') {
        return null;
    }
    return <CellUi.LockIcon message={labels.getLocalizedString('valueLocked')} alignment={cell.getAlignment()} components={props.components} />;
};
