import { IGridValueRenderer } from "@controls/grid/value-renderer";
import { ICellUiControlComponents } from "../ui";

/** The replaceable pieces of a cell's control: the room it is drawn in, and what draws the value. */
export interface ICellControlComponents extends ICellUiControlComponents {
    /** What draws the cell's value, the only slot handed a `defaultRender`. */
    onRenderControl: (props: IGridValueRenderer, defaultRender: (props: IGridValueRenderer) => JSX.Element | null) => JSX.Element | null;
}

/** The default for {@link ICellControlComponents.onRenderControl}. */
export const CellControlComponents: Pick<ICellControlComponents, 'onRenderControl'> = {
    onRenderControl: (props, defaultRender) => defaultRender(props),
};
