import { CellUi, ICellUiLockIconProps } from "../../../cells/ui";

/** The replaceable pieces of what a column header draws after the name. */
export interface IColumnHeaderUiSuffixComponents {
    /** What they are drawn in. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** What says the column cannot be changed, `CellUi.LockIcon` by default. */
    onRenderLockIcon: (props: ICellUiLockIconProps) => JSX.Element | null;
}

/** The defaults for {@link IColumnHeaderUiSuffixComponents}. */
export const ColumnHeaderUiSuffixComponents: IColumnHeaderUiSuffixComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderLockIcon: props => <CellUi.LockIcon {...props} />,
};
