import { GridValueRenderer, IGridValueRenderer } from "@controls/grid/value-renderer";
import { CellUi, ICellControlProps } from "../ui";

/** The replaceable pieces of a cell's control. */
export interface IGridControlComponents {
    /** The inset the control is drawn in. */
    onRenderControlContainer: (props: ICellControlProps) => JSX.Element;
    /** What draws the cell's value, handed what the control resolved to. */
    onRenderControl: (props: IGridValueRenderer, defaultRender: (props: IGridValueRenderer) => JSX.Element | null) => JSX.Element | null;
}

/** The defaults for {@link IGridControlComponents}. */
export const GridControlComponents: IGridControlComponents = {
    onRenderControlContainer: props => <CellUi.Control {...props} />,
    onRenderControl: (props, defaultRender) => defaultRender(props),
};
