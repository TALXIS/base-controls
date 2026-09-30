import { useGridService } from "../../../useGridService";
import { useGridCell } from "../root/context";
import { CellLockIconComponents, ICellLockIconComponents } from "./components";

export interface ICellLockIconProps {
    components?: Partial<ICellLockIconComponents>;
}

/** What says a cell of an editable column is locked for its record. */
export const CellLockIcon = (props: ICellLockIconProps) => {
    const cell = useGridCell();
    const editability = useGridService('editability');
    const labels = useGridService('labels');
    const components = { ...CellLockIconComponents, ...props.components };

    //a locked column is marked in its header, a locked record by its muted row
    if (editability.get({ record: cell.getRecord(), columnName: cell.getColumnName() }).lockedBy !== 'cell') {
        return null;
    }
    return components.onRenderLockIcon({ message: labels.getLocalizedString('valueNotEditable'), alignment: cell.getAlignment() });
};
