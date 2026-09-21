import { CellUi, ICellUiLoadingProps } from "../ui";

/** The replaceable pieces of what a cell shows while it waits. */
export interface ICellLoadingComponents {
    /** What stands in for the content while the cell waits. `CellUi.Loading` is what draws it by default. */
    onRenderLoading: (props: ICellUiLoadingProps) => JSX.Element;
}

/** The defaults for {@link ICellLoadingComponents}. */
export const CellLoadingComponents: ICellLoadingComponents = {
    onRenderLoading: props => <CellUi.Loading {...props} />,
};
