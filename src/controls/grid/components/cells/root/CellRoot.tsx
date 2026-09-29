import { useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecordEvents } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useGridService } from "../../../useGridService";
import { IGridEditedCell, IGridEditingEvents } from "../../../services/editing";
import { GridCellContext, GridCellRevisionContext } from "./context";

//`useEventEmitter` keys its subscription on the array it is given
const RECORD_EVENTS: (keyof IRecordEvents)[] = ['onFieldValueChanged', 'onAfterSaved'];

export interface ICellRootProps extends ICellRendererParams {
    /** Whether this is the cell AG Grid opened over the one that was there. */
    isEditor?: boolean;
    children?: React.ReactNode;
}

/** What makes a cell a cell of this grid: everything inside it belongs to one `GridCell`. */
export const CellRoot = (props: ICellRootProps) => {
    const { data: record, children } = props;
    const cells = useGridService('cells');
    const editing = cells.editing;
    const parentCell = useContext(GridCellContext);
    const colDef = props.colDef!;
    //editors and one-click columns take input
    const takesInput = !!props.isEditor || !!colDef.settings?.cell?.oneClickEdit;
    const cell = useMemo(
        () => cells.createCell({ record: record, colDef: colDef, node: props.node, takesInput: takesInput, element: props.eGridCell }),
        [cells, record, colDef, props.node, takesInput, props.eGridCell]);
    const [revision, setRevision] = useState(() => Symbol('cellRevision'));
    const redraw = useCallback(() => setRevision(Symbol('cellRevision')), []);

    const isThisCell = (edited: IGridEditedCell | undefined) => {
        return edited?.recordId === record.getRecordId() && edited?.columnName === cell.getColumnName();
    }

    //any field can decide what another cell of the row draws
    useEventEmitter<IRecordEvents>(record, RECORD_EVENTS, () => {
        redraw();
    });

    //both sides of the change redraw: `AutoFocus` is whether this cell is edited
    useEventEmitter<IGridEditingEvents>(editing.events, 'onEditedCellChanged', (previous, next) => {
        if (isThisCell(previous) || isThisCell(next)) {
            redraw();
        }
    });

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
