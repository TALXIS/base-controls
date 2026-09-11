import { CellUi, ICellContainerProps } from "../ui";

/** The replaceable pieces of a cell's host. Override through `ICellHostProps.components`. */
export interface ICellHostComponents {
    /** The element the cell is drawn in, and what its theme reaches the content through. */
    onRenderContainer: (props: ICellContainerProps) => JSX.Element;
    /** What a cell shows while it is waiting. Called only while it is. */
    onRenderLoading: () => JSX.Element;
}

/** The defaults for {@link ICellHostComponents}. */
export const CellHostComponents: ICellHostComponents = {
    onRenderContainer: props => <CellUi.Container {...props} />,
    onRenderLoading: () => <CellUi.Loading />,
};
