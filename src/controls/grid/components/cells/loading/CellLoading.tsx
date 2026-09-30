import { useIsInsideCellContainer } from "../container/context";
import { useGridCell } from "../root/context";
import { CellUi, ICellUiLoadingComponents } from "../ui";

export interface ICellLoadingProps {
    children?: React.ReactNode;
    components?: Partial<ICellUiLoadingComponents>;
}

/** What a cell shows while it is waiting, in place of whatever is wrapped in this. */
export const CellLoading = (props: ICellLoadingProps) => {
    const cell = useGridCell();
    const hasContainerAbove = useIsInsideCellContainer();

    //what it draws stands in for the cell's content
    if (!hasContainerAbove) {
        throw new Error('Grid.Cell.Loading has to be drawn inside Grid.Cell.Container, around the content it stands in for.');
    }
    return <CellUi.Loading isLoading={cell.isLoading()} components={props.components}>{props.children}</CellUi.Loading>;
};
