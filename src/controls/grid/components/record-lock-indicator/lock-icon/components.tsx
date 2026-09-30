import { CellUi, ICellUiLockIconProps } from "../../cells/ui";

/** The replaceable pieces of the lock a locked record's row shows. */
export interface ILockIconComponents {
    /** The icon itself, `CellUi.LockIcon` by default. */
    onRenderLockIcon: (props: ICellUiLockIconProps) => JSX.Element;
}

/** The defaults for {@link ILockIconComponents}. */
export const LockIconComponents: ILockIconComponents = {
    onRenderLockIcon: props => <CellUi.LockIcon {...props} />,
};
