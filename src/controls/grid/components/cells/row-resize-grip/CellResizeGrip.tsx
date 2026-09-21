import { useEffect } from "react";
import { useRerender } from "@legacy";
import { useGridService } from "../../../useGridService";
import { useIsInsideCellContainer } from "../container/context";
import { useGridCell } from "../root/context";
import { CellResizeGripComponents, ICellResizeGripComponents } from "./components";

export interface ICellResizeGripProps {
    children?: React.ReactNode;
    components?: Partial<ICellResizeGripComponents>;
}

/** What a row is dragged taller by, around the cell that is dragged. */
export const CellResizeGrip = (props: ICellResizeGripProps) => {
    const { children } = props;
    const cell = useGridCell();
    const hasContainerAbove = useIsInsideCellContainer();
    const gridApi = useGridService('gridApi');
    const components = { ...CellResizeGripComponents, ...props.components };
    const node = cell.getNode();
    const rerender = useRerender();

    //what a drag starts from is the row's height, and the row is what another cell's drag changed
    useEffect(() => {
        const onHeightChanged = () => rerender();
        node?.addEventListener('heightChanged', onHeightChanged);
        return () => node?.removeEventListener('heightChanged', onHeightChanged);
    }, [node]);

    //AG Grid measures the renderer, not the editor, for an auto-height row
    const onResize = (height: number) => {
        node?.setRowHeight(height);
        gridApi?.onRowHeightChanged();
    };

    //the drag grows this element, so the container has to be inside it
    if (hasContainerAbove) {
        throw new Error('Grid.Cell.ResizeGrip has to be drawn around Grid.Cell.Container rather than inside it.');
    }
    return components.onRenderRowResizeGrip({
        height: node?.rowHeight ?? undefined,
        onResize: onResize,
        children: children,
    });
};
