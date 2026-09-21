import { useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecordEvents } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useGridService } from "../../../useGridService";
import { IGridEditedCell, IGridEditingEvents } from "../../../services/editing";
import { GridCellContext, GridCellRevisionContext } from "./context";

//`useEventEmitter` keys its subscription on the array it is given
const RECORD_EVENTS: (keyof IRecordEvents)[] = ['onFieldValueChanged', 'onAfterSaved'];

export interface IGridCellRootProps extends ICellRendererParams {
    /** Whether this is the cell AG Grid opened over the one that was there. */
    isEditor?: boolean;
    children?: React.ReactNode;
}

/**
 * What makes a cell a cell of this grid: everything drawn inside it belongs to one `GridCell`.
 *
 * The order the pieces nest in is the contract, and each one throws where it is put wrong:
 *
 * ```tsx
 * <Grid.Field record={props.data} name={props.colDef.colId}>   //only where the cell is bound to one
 *     <Grid.CellRoot {...props}>
 *         <Grid.CellTheme>
 *             <Grid.RowResizeGrip>                             //outside the container it grows
 *                 <Grid.CellContainer>
 *                     <Grid.CellLoading>                       //inside it, around what it stands in for
 *                         <Grid.FieldValidation>               //needs a field above it
 *                             <Grid.Control />                 //needs a field above it
 *                             <Grid.CellCommands />
 *                         </Grid.FieldValidation>
 *                     </Grid.CellLoading>
 *                 </Grid.CellContainer>
 *             </Grid.RowResizeGrip>
 *         </Grid.CellTheme>
 *     </Grid.CellRoot>
 * </Grid.Field>
 * ```
 */
export const CellRoot = (props: IGridCellRootProps) => {
    const { data: record, children } = props;
    const cells = useGridService('cells');
    const editing = useGridService('editing');
    const parentCell = useContext(GridCellContext);
    const colDef = props.colDef!;
    //an editor takes input whatever the column is, and a one-click column takes it without one
    const takesInput = !!props.isEditor || !!colDef.settings?.oneClickEdit;
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

    //`AutoFocus` is whether this cell is the one being edited, so both sides of the change redraw
    useEventEmitter<IGridEditingEvents>(editing, 'onEditedCellChanged', (previous, next) => {
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
        throw new Error('Grid.CellRoot cannot be drawn inside another one: a cell is not made of cells.');
    }

    return <GridCellContext.Provider value={cell}>
        <GridCellRevisionContext.Provider value={revision}>{children}</GridCellRevisionContext.Provider>
    </GridCellContext.Provider>;
};
