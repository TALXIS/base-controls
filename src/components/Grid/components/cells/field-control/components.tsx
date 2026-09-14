import { CellUi, ICellControlProps } from "../ui";

/** The replaceable pieces of a cell's field control. */
export interface IGridFieldControlComponents {
    /** What draws the cell's value, and the inset it is drawn in. */
    onRenderControl: (props: ICellControlProps) => JSX.Element;
}

/** The defaults for {@link IGridFieldControlComponents}. */
export const FieldControlComponents: IGridFieldControlComponents = {
    onRenderControl: props => <CellUi.Control {...props} />,
};
