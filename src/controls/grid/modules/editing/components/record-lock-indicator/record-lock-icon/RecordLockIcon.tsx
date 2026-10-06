import { useMemo } from "react";
import { useGridService } from "../../../../../useGridService";
import { useGridCell } from "../../../../../components/cells/root/context";
import { CellUi, ICellUiLockIconComponents } from "../../../../../components/cells/ui";
import { getRecordLockIconStyles } from "./styles";

export interface IRecordLockIconProps {
    components?: Partial<ICellUiLockIconComponents>;
}

/** The lock drawn for a record locked as a whole, or nothing. */
export const RecordLockIcon = (props: IRecordLockIconProps) => {
    const cell = useGridCell();
    const locks = useGridService('editing')?.locks;
    const labels = useGridService('labels');
    const styles = useMemo(() => getRecordLockIconStyles(), []);

    if (locks?.get({ record: cell.getRecord() }).lockedBy !== 'record') {
        return null;
    }
    return <CellUi.LockIcon className={styles.icon} message={labels.getLocalizedString('recordLocked')} components={props.components} />;
};
