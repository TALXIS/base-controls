import { useIsInsideCellContainer } from "../container/context";
import { useGridCell } from "../root/context";
import { CellLoadingComponents, IGridCellLoadingComponents } from "./components";

export interface IGridCellLoadingProps {
    children?: React.ReactNode;
    components?: Partial<IGridCellLoadingComponents>;
}

/** What a cell shows while it is waiting, in place of whatever is wrapped in this. */
export const CellLoading = (props: IGridCellLoadingProps) => {
    const cell = useGridCell();
    const hasContainerAbove = useIsInsideCellContainer();
    const components = { ...CellLoadingComponents, ...props.components };

    //what it draws stands in for the cell's content
    if (!hasContainerAbove) {
        throw new Error('Grid.CellLoading has to be drawn inside Grid.CellContainer, around the content it stands in for.');
    }
    return components.onRenderLoading({ isLoading: cell.isLoading(), children: props.children });
};
