import { useEffect } from "react";
import { useRerender } from "@legacy";
import { useGridService } from "../../../useGridService";
import { useIsInsideCellContainer } from "../container/context";
import { useGridCell } from "../root/context";
import { CellUi, ICellUiResizeGripComponents } from "../ui";

export interface ICellResizeGripProps {
    children?: React.ReactNode;
    components?: Partial<ICellUiResizeGripComponents>;
}

/** What a row is dragged taller by, around the cell that is dragged. */
export const CellResizeGrip = (props: ICellResizeGripProps) => {
    const { children } = props;
    const cell = useGridCell();
    const hasContainerAbove = useIsInsideCellContainer();
    const rows = useGridService('rows');
    const node = cell.getNode();
    const { rerender } = useRerender();

    //another cell's drag changes the row height a drag starts from
    useEffect(() => {
        const onHeightChanged = () => rerender();
        node?.addEventListener('heightChanged', onHeightChanged);
        return () => node?.removeEventListener('heightChanged', onHeightChanged);
    }, [node]);

    const onResize = (height: number) => rows.setRowHeight(cell.getRecord(), height);

    //the container sits inside the element the drag grows
    if (hasContainerAbove) {
        throw new Error('Grid.Cell.ResizeGrip has to be drawn around Grid.Cell.Container rather than inside it.');
    }
    return <CellUi.ResizeGrip height={node?.rowHeight ?? undefined} onResize={onResize} components={props.components}>{children}</CellUi.ResizeGrip>;
};
