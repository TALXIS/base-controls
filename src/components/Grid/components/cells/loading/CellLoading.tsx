import { useIsInsideCellContainer } from "../container/context";
import { useGridCell } from "../root/context";
import { CellLoadingComponents, IGridCellLoadingComponents } from "./components";

export interface IGridCellLoadingProps {
    children?: React.ReactNode;
    components?: Partial<IGridCellLoadingComponents>;
}

/**
 * What a cell shows while it is waiting, in place of whatever is wrapped in this.
 *
 * Wrap it around the content a cell has to have loaded to draw; content that can be drawn regardless - the
 * commands, a checkbox - belongs outside it. Whether a cell is waiting is the cell's own answer, which is
 * a module's to give through a loading hook.
 */
export const CellLoading = (props: IGridCellLoadingProps) => {
    const cell = useGridCell();
    const hasContainerAbove = useIsInsideCellContainer();
    const components = { ...CellLoadingComponents, ...props.components };

    //what it draws stands in for the cell's content, so outside the container it would stand in for the
    //cell itself: a shimmer with none of the cell's surface under it
    if (!hasContainerAbove) {
        throw new Error('Grid.CellLoading has to be drawn inside Grid.CellContainer, around the content it stands in for.');
    }
    if (cell.isLoading()) {
        return components.onRenderLoading();
    }
    return <>{props.children}</>;
};
