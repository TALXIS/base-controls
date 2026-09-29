import { IGridValueRenderer } from "@controls/grid/value-renderer";
import { CellUi, ICellUiControlProps } from "../ui";

/** The replaceable pieces of a cell's control. */
export interface ICellControlComponents {
    /** The inset the control is drawn in, `CellUi.Control` by default. */
    onRenderControlContainer: (props: ICellUiControlProps) => JSX.Element;
    /** What draws the cell's value, the only slot handed a `defaultRender`. */
    onRenderControl: (props: IGridValueRenderer, defaultRender: (props: IGridValueRenderer) => JSX.Element | null) => JSX.Element | null;
}

/** The defaults for {@link ICellControlComponents}. */
export const CellControlComponents: ICellControlComponents = {
    onRenderControlContainer: props => <CellUi.Control {...props} />,
    onRenderControl: (props, defaultRender) => defaultRender(props),
};
