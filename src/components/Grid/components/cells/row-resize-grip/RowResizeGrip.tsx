import { IRecord } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { IGridRowsEvents } from "../../../services/rows";
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
    const record = cell.getRecord();
    const rows = useGridService('rows');
    const components = { ...RowResizeGripComponents, ...props.components };
    const rerender = useRerender();

    //a height set anywhere else - another cell of the same row being dragged - is this cell's height too
    useEventEmitter<IGridRowsEvents>(rows, 'onRowHeightChanged', (changed: IRecord) => {
        if (changed.getRecordId() === record.getRecordId()) {
            rerender();
        }
    });

    //a container above this means the grip was drawn inside one, and the drag grows this element while
    //the container has already been sized to what holds it: the container has to be the one inside
    if (hasContainerAbove) {
        throw new Error('Grid.RowResizeGrip has to be drawn around Grid.CellContainer rather than inside it.');
    }
    if (!cell.getColDef().autoHeight) {
        return <>{children}</>;
    }
    return components.onRenderRowResizeGrip({
        height: rows.getHeight(record),
        onResizeEnd: height => rows.setHeight(record, height),
        children: children,
    });
};
