import { IGridValueRenderer } from "@controls/grid/value-renderer";

/** The replaceable piece of what a column draws for a cell's value. */
export interface ICellColumnControlComponents {
    /** What draws the cell's value, the only slot handed a `defaultRender`. */
    onRenderControl: (props: IGridValueRenderer, defaultRender: (props: IGridValueRenderer) => JSX.Element | null) => JSX.Element | null;
}

/** The defaults for {@link ICellColumnControlComponents}. */
export const CellColumnControlComponents: ICellColumnControlComponents = {
    onRenderControl: (props, defaultRender) => defaultRender(props),
};
