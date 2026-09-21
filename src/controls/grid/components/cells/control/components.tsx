import { GridValueRenderer, IGridValueRenderer } from "@controls/grid/value-renderer";
import { CellUi, ICellUiControlProps } from "../ui";

/** The replaceable pieces of a cell's control. */
export interface ICellControlComponents {
    /** The inset the control is drawn in. `CellUi.Control` is what draws it by default. */
    onRenderControlContainer: (props: ICellUiControlProps) => JSX.Element;
    /**
     * What draws the cell's value, handed what the control resolved to.
     *
     * The only slot handed a `defaultRender`, because its default is a choice rather than a component: a
     * column that named a control of its own is drawn by `CellLegacyNestedControl`, and any other by
     * `GridValueRenderer`.
     */
    onRenderControl: (props: IGridValueRenderer, defaultRender: (props: IGridValueRenderer) => JSX.Element | null) => JSX.Element | null;
}

/** The defaults for {@link ICellControlComponents}. */
export const CellControlComponents: ICellControlComponents = {
    onRenderControlContainer: props => <CellUi.Control {...props} />,
    onRenderControl: (props, defaultRender) => defaultRender(props),
};
