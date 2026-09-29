import { CellUi, ICellUiResizeGripProps } from "../ui";

/** The replaceable pieces of what a row is dragged taller by. */
export interface ICellResizeGripComponents {
    /** What the drag is done with, `CellUi.ResizeGrip` by default. */
    onRenderRowResizeGrip: (props: ICellUiResizeGripProps) => JSX.Element;
}

/** The defaults for {@link ICellResizeGripComponents}. */
export const CellResizeGripComponents: ICellResizeGripComponents = {
    onRenderRowResizeGrip: props => <CellUi.ResizeGrip {...props} />,
};
