import { useGridService } from "../../../useGridService";
import { useGridCell } from "../root/context";
import { CellUneditableIconComponents, ICellUneditableIconComponents } from "./components";

export interface ICellUneditableIconProps {
    components?: Partial<ICellUneditableIconComponents>;
}

/** What says a cell of an editable column is locked for its record. */
export const CellUneditableIcon = (props: ICellUneditableIconProps) => {
    const cell = useGridCell();
    const settings = useGridService('settings');
    const labels = useGridService('labels');
    const components = { ...CellUneditableIconComponents, ...props.components };

    //a read-only column is marked once, in its header
    const isLockedForRecord = settings.isEditingEnabled() && cell.getSettings().isEditable !== false && !cell.isEditable();
    if (!isLockedForRecord) {
        return null;
    }
    return components.onRenderUneditableIcon({ message: labels.getLocalizedString('valueNotEditable'), alignment: cell.getAlignment() });
};
