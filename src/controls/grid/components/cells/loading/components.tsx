import { CellUi, ICellLoadingProps } from "../ui";

/** The replaceable pieces of what a cell shows while it waits. */
export interface IGridCellLoadingComponents {
    /** What stands in for the content while the cell waits, and draws it once it no longer does. */
    onRenderLoading: (props: ICellLoadingProps) => JSX.Element;
}

/** The defaults for {@link IGridCellLoadingComponents}. */
export const CellLoadingComponents: IGridCellLoadingComponents = {
    onRenderLoading: props => <CellUi.Loading {...props} />,
};
