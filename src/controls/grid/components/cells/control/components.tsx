import { GridCellRenderer, IGridCellRenderer } from "@controls/grid/cell-renderer";
import { CellUi, ICellControlProps } from "../ui";

/** The replaceable pieces of a cell's control. */
export interface IGridControlComponents {
    /** The inset the control is drawn in. */
    onRenderControlContainer: (props: ICellControlProps) => JSX.Element;
    /** What draws the cell's value, handed what the control resolved to. */
    onRenderControl: (props: IGridCellRenderer, defaultRender: (props: IGridCellRenderer) => JSX.Element | null) => JSX.Element | null;
}

/** The defaults for {@link IGridControlComponents}. */
export const GridControlComponents: IGridControlComponents = {
    onRenderControlContainer: props => <CellUi.Control {...props} />,
    onRenderControl: (props, defaultRender) => defaultRender(props),
};
