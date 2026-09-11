import { ICommandsComponents } from "../adapters/commands/components";
import { IControlComponents } from "../adapters/control/components";
import { CellUi, ICellContainerProps, IRowResizeGripProps } from "../ui";

/** The replaceable pieces of a cell's host. Override through `ICellHostProps.components`. */
export interface ICellHostComponents {
    /** The element the cell is drawn in, and what its theme reaches the content through. */
    onRenderContainer: (props: ICellContainerProps) => JSX.Element;
    /** What the cell's control is drawn with: the element it sits in, and what draws the value. */
    control?: Partial<IControlComponents>;
    /** What a row is dragged taller by. Called only where the column can grow. */
    onRenderRowResizeGrip?: (props: IRowResizeGripProps) => JSX.Element;
    /** What a cell shows while it is waiting. Called only while it is. */
    onRenderLoading: () => JSX.Element;
    /** What the cell's commands are drawn with. */
    commands?: Partial<ICommandsComponents>;
}

/** The defaults for {@link ICellHostComponents}. */
export const CellHostComponents: ICellHostComponents = {
    onRenderContainer: props => <CellUi.Container {...props} />,
    onRenderLoading: () => <CellUi.Loading />,
    onRenderRowResizeGrip: props => <CellUi.RowResizeGrip {...props} />,
};
