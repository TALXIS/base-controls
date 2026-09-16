import { useEffect } from "react";
import { useRerender } from "@legacy";
import { useGridService } from "../../../useGridService";
import { useIsInsideCellContainer } from "../container/context";
import { useGridCell } from "../root/context";
import { RowResizeGripComponents, IGridRowResizeGripComponents } from "./components";

export interface IGridRowResizeGripProps {
    children?: React.ReactNode;
    components?: Partial<IGridRowResizeGripComponents>;
}

/**
 * What a row is dragged taller by, around the cell that is dragged.
 *
 * Wraps the cell rather than sitting in it: the drag grows this element, and the row takes its height from
 * what its cells measure. Draws the grip only on a column that says `autoHeight`, because a row whose
 * height AG Grid decides cannot be dragged to another one.
 */
export const RowResizeGrip = (props: IGridRowResizeGripProps) => {
    const { children } = props;
    const cell = useGridCell();
    const hasContainerAbove = useIsInsideCellContainer();
    const gridApi = useGridService('gridApi');
    const components = { ...RowResizeGripComponents, ...props.components };
    const node = cell.getNode();
    const rerender = useRerender();

    //what a drag starts from is the row's height, and the row is what another cell's drag changed
    useEffect(() => {
        const onHeightChanged = () => rerender();
        node?.addEventListener('heightChanged', onHeightChanged);
        return () => node?.removeEventListener('heightChanged', onHeightChanged);
    }, [node]);

    //the row rather than the cell: AG Grid works an auto-height row out from what its cells measure, and
    //an editor is not one of the cells it measures
    const onResize = (height: number) => {
        node?.setRowHeight(height);
        gridApi?.onRowHeightChanged();
    };

    //a container above this means the grip was drawn inside one, and the drag grows this element while
    //the container has already been sized to what holds it: the container has to be the one inside
    if (hasContainerAbove) {
        throw new Error('Grid.RowResizeGrip has to be drawn around Grid.CellContainer rather than inside it.');
    }
    if (!cell.getColDef().autoHeight) {
        return <>{children}</>;
    }
    return components.onRenderRowResizeGrip({
        height: node?.rowHeight ?? undefined,
        onResize: onResize,
        children: children,
    });
};
