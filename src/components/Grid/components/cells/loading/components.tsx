import { CellUi } from "../ui";

/** The replaceable pieces of what a cell shows while it waits. */
export interface IGridCellLoadingComponents {
    /** What is drawn in place of the content. Called only while the cell is waiting. */
    onRenderLoading: () => JSX.Element;
}

/** The defaults for {@link IGridCellLoadingComponents}. */
export const CellLoadingComponents: IGridCellLoadingComponents = {
    onRenderLoading: () => <CellUi.Loading />,
};
