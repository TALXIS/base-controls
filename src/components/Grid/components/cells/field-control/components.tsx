import { CellUi, ICellControlProps } from "../../ui";

/** The replaceable pieces of a cell's control. */
export interface IControlComponents {
    /** What draws the cell's value, and the inset it is drawn in. */
    onRenderControl: (props: ICellControlProps) => JSX.Element;
}

/** The defaults for {@link IControlComponents}. */
export const ControlComponents: IControlComponents = {
    onRenderControl: props => <CellUi.Control {...props} />,
};
