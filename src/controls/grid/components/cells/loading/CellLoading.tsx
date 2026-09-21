import { useIsInsideCellContainer } from "../container/context";
import { useGridCell } from "../root/context";
import { CellLoadingComponents, ICellLoadingComponents } from "./components";

export interface ICellLoadingProps {
    children?: React.ReactNode;
    components?: Partial<ICellLoadingComponents>;
}

/** What a cell shows while it is waiting, in place of whatever is wrapped in this. */
export const CellLoading = (props: ICellLoadingProps) => {
    const cell = useGridCell();
    const hasContainerAbove = useIsInsideCellContainer();
    const components = { ...CellLoadingComponents, ...props.components };

    //what it draws stands in for the cell's content
    if (!hasContainerAbove) {
        throw new Error('Grid.Cell.Loading has to be drawn inside Grid.Cell.Container, around the content it stands in for.');
    }
    return components.onRenderLoading({ isLoading: cell.isLoading(), children: props.children });
};
