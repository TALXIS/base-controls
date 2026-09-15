import { GridCellRenderer, IGridCellRenderer } from "@components/GridCellRenderer";

/** The replaceable pieces of what draws a cell's value. */
export interface IGridControlRendererComponents {
    /** What draws the value, which is the grid's own cell renderer unless something replaces it. */
    onRenderValue: (props: IGridCellRenderer) => JSX.Element;
}

/** The defaults for {@link IGridControlRendererComponents}. */
export const ControlRendererComponents: IGridControlRendererComponents = {
    onRenderValue: props => <GridCellRenderer {...props} />,
};
