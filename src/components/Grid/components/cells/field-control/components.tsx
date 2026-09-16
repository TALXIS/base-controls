import { ControlRendererComponents, IGridControlRendererComponents } from "../control-renderer/components";
import { CellUi, ICellControlProps } from "../ui";

/** The replaceable pieces of a cell's field control. */
export interface IGridFieldControlComponents extends Pick<IGridControlRendererComponents, 'onRenderValue'> {
    /** The inset the value is drawn in. */
    onRenderControl: (props: ICellControlProps) => JSX.Element;
}

/** The defaults for {@link IGridFieldControlComponents}. */
export const FieldControlComponents: IGridFieldControlComponents = {
    onRenderControl: props => <CellUi.Control {...props} />,
    //the one default, held where the component that draws with it holds it
    onRenderValue: ControlRendererComponents.onRenderValue,
};
