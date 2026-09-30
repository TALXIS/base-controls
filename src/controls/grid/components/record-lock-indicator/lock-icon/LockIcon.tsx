import { useMemo } from "react";
import { useGridService } from "../../../useGridService";
import { useGridCell } from "../../cells/root/context";
import { ILockIconComponents, LockIconComponents } from "./components";
import { getLockIconStyles } from "./styles";

export interface ILockIconProps {
    components?: Partial<ILockIconComponents>;
}

/** The lock drawn for a record locked as a whole, or nothing. */
export const LockIcon = (props: ILockIconProps) => {
    const cell = useGridCell();
    const editability = useGridService('editability');
    const labels = useGridService('labels');
    const styles = useMemo(() => getLockIconStyles(), []);
    const components = { ...LockIconComponents, ...props.components };

    if (editability.get({ record: cell.getRecord() }).lockedBy !== 'record') {
        return null;
    }
    return components.onRenderLockIcon({ className: styles.icon, message: labels.getLocalizedString('recordNotEditable') });
};
