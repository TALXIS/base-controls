import { CellUi, ICellUiLockIconProps } from "../ui";

/** The replaceable pieces of what says a cell cannot be edited. */
export interface ICellLockIconComponents {
    /** The icon itself, `CellUi.LockIcon` by default. */
    onRenderLockIcon: (props: ICellUiLockIconProps) => JSX.Element;
}

/** The defaults for {@link ICellLockIconComponents}. */
export const CellLockIconComponents: ICellLockIconComponents = {
    onRenderLockIcon: props => <CellUi.LockIcon {...props} />,
};
