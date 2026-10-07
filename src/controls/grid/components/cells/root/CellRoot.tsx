import { useContext, useLayoutEffect, useMemo } from "react";
import { ICellRendererParams } from "ag-grid-community";
import { IRecordEvents } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useRerender } from "@legacy";
import { useGridService } from "../../../useGridService";
import { IGridCellEvents } from "../../../services/cells";
import { GridCellContext, GridCellRevisionContext } from "./context";
import { useGridField } from "../field/context";

//`useEventEmitter` keys its subscription on the array it is given
const RECORD_EVENTS: (keyof IRecordEvents)[] = ['onFieldValueChanged', 'onAfterSaved'];

export interface ICellRootProps extends ICellRendererParams {
    /** Whether the cell's control takes input instead of showing the value. */
    takesInput?: boolean;
    children?: React.ReactNode;
}

/** What makes a cell a cell of this grid: everything inside it belongs to one `GridCell`. */
export const CellRoot = (props: ICellRootProps) => {
    const { data: record, children } = props;
    const cells = useGridService('cells');
    const parentCell = useContext(GridCellContext);
    const field = useGridField();
    const colDef = props.colDef!;
    const takesInput = !!props.takesInput;
    const cell = useMemo(() => cells.createCell({ record: record, colDef: colDef, node: props.node, takesInput: takesInput, element: props.eGridCell, field: field }),[cells, record, colDef, props.node, takesInput, props.eGridCell, field]);
    const { rerender: redraw, revision } = useRerender();

    //any field can decide what another cell of the row draws
    useEventEmitter<IRecordEvents>(record, RECORD_EVENTS, () => {
        redraw();
    });

    useEventEmitter<IGridCellEvents>(cell.events, 'onRenderRequested', redraw);

    useLayoutEffect(() => {
        cells.addCell(cell);
        return () => cells.removeCell(cell);
    }, [cells, cell]);

    //a cell inside a cell is two cells for one column of one record
    if (parentCell) {
        throw new Error('Grid.Cell.Root cannot be drawn inside another one: a cell is not made of cells.');
    }

    return <GridCellContext.Provider value={cell}>
        <GridCellRevisionContext.Provider value={revision}>{children}</GridCellRevisionContext.Provider>
    </GridCellContext.Provider>;
};
