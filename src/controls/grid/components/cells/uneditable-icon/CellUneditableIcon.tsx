import { useGridService } from "../../../useGridService";
import { useGridCell } from "../root/context";
import { CellUneditableIconComponents, ICellUneditableIconComponents } from "./components";

export interface ICellUneditableIconProps {
    components?: Partial<ICellUneditableIconComponents>;
}

/** What says a cell of an editable column is locked for its record. */
export const CellUneditableIcon = (props: ICellUneditableIconProps) => {
    const cell = useGridCell();
    const editability = useGridService('editability');
    const labels = useGridService('labels');
    const components = { ...CellUneditableIconComponents, ...props.components };

    //a locked column is marked in its header, a locked record by its muted row
    if (editability.get({ record: cell.getRecord(), columnName: cell.getColumnName() }).lockedBy !== 'cell') {
        return null;
    }
    return components.onRenderUneditableIcon({ message: labels.getLocalizedString('valueNotEditable'), alignment: cell.getAlignment() });
};
