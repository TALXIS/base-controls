import { CellUi, ICellUiContainerProps } from "../ui";

/** The replaceable pieces of the element a cell's content is drawn in. */
export interface ICellContainerComponents {
    /** The element itself, `CellUi.Container` by default. */
    onRenderContainer: (props: ICellUiContainerProps) => JSX.Element;
}

/** The defaults for {@link ICellContainerComponents}. */
export const CellContainerComponents: ICellContainerComponents = {
    onRenderContainer: props => <CellUi.Container {...props} />,
};
