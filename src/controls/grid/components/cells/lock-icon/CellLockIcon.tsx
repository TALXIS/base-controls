import { useGridService } from "../../../useGridService";
import { useGridCell } from "../root/context";
import { CellUi, ICellUiLockIconComponents } from "../ui";

export interface ICellLockIconProps {
    components?: Partial<ICellUiLockIconComponents>;
}

/** What says a cell of an editable column is locked for its record. */
export const CellLockIcon = (props: ICellLockIconProps) => {
    const cell = useGridCell();
    const editability = useGridService('editability');
    const labels = useGridService('labels');

    //a locked column is marked in its header, a locked record by its muted row
    if (editability.get({ record: cell.getRecord(), columnName: cell.getColumnName() }).lockedBy !== 'cell') {
        return null;
    }
    return <CellUi.LockIcon message={labels.getLocalizedString('valueNotEditable')} alignment={cell.getAlignment()} components={props.components} />;
};
