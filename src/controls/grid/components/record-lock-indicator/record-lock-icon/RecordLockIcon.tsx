import { useMemo } from "react";
import { useGridService } from "../../../useGridService";
import { useGridCell } from "../../cells/root/context";
import { CellUi, ICellUiLockIconComponents } from "../../cells/ui";
import { getLockIconStyles } from "./styles";

export interface ILockIconProps {
    components?: Partial<ICellUiLockIconComponents>;
}

/** The lock drawn for a record locked as a whole, or nothing. */
export const LockIcon = (props: ILockIconProps) => {
    const cell = useGridCell();
    const editability = useGridService('editability');
    const labels = useGridService('labels');
    const styles = useMemo(() => getLockIconStyles(), []);

    if (editability.get({ record: cell.getRecord() }).lockedBy !== 'record') {
        return null;
    }
    return <CellUi.LockIcon className={styles.icon} message={labels.getLocalizedString('recordNotEditable')} components={props.components} />;
};
