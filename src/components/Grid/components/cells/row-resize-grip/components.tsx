import { CellUi, IRowResizeGripProps } from "../ui";

/** The replaceable pieces of what a row is dragged taller by. */
export interface IGridRowResizeGripComponents {
    /** What the drag is done with, around what it grows. Called only where the column can grow. */
    onRenderRowResizeGrip: (props: IRowResizeGripProps) => JSX.Element;
}

/** The defaults for {@link IGridRowResizeGripComponents}. */
export const RowResizeGripComponents: IGridRowResizeGripComponents = {
    onRenderRowResizeGrip: props => <CellUi.RowResizeGrip {...props} />,
};
