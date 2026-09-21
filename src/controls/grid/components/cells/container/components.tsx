import { CellUi, ICellContainerProps } from "../ui";

/** The replaceable pieces of the element a cell's content is drawn in. */
export interface IGridCellContainerComponents {
    /** The element itself, handed what the cell draws. `CellUi.Container` is what draws it by default. */
    onRenderContainer: (props: ICellContainerProps) => JSX.Element;
}

/** The defaults for {@link IGridCellContainerComponents}. */
export const CellContainerComponents: IGridCellContainerComponents = {
    onRenderContainer: props => <CellUi.Container {...props} />,
};
