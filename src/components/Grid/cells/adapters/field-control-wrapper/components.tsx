import { CellUi, IControlUiProps } from "../../ui";

/** How a field's control is framed. Override through `IFieldControlWrapperProps.components`. */
export interface IFieldControlWrapperComponents {
    /**
     * The element the control is drawn in, and what gives it its inset in the cell.
     *
     * `children` is whatever drew, so replacing this changes what surrounds a control rather than what the
     * control is.
     */
    onRenderContainer: (props: IControlUiProps) => JSX.Element;
}

/** The defaults for {@link IFieldControlWrapperComponents}. */
export const FieldControlWrapperComponents: IFieldControlWrapperComponents = {
    onRenderContainer: props => <CellUi.Control {...props} />,
};
