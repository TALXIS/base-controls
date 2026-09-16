import { useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecordEvents } from "@talxis/client-libraries";
import { ThemeContext } from "@utils";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { IGridCellRendererParams } from "../../interfaces";
import { useGridService } from "../../../useGridService";
import { IGridEditedCell, IGridEditingEvents } from "../../../services/editing";
import { GridCellContext, GridCellRevisionContext } from "./context";

//`useEventEmitter` keys its subscription on the array it is given
const RECORD_EVENTS: (keyof IRecordEvents)[] = ['onFieldValueChanged', 'onAfterSaved'];

export interface IGridCellRootProps extends ICellRendererParams, IGridCellRendererParams {
    children?: React.ReactNode;
}

/** What makes a cell a cell of this grid: everything drawn inside it belongs to one `GridCell`. */
export const CellRoot = (props: IGridCellRootProps) => {
    const { data: record, children } = props;
    const cells = useGridService('cells');
    const editing = useGridService('editing');
    const parentCell = useContext(GridCellContext);
    const colDef = props.colDef!;
    const cell = useMemo(() => cells.createCell(record, colDef, props.node, props.takesInput), [cells, record, colDef, props.node, props.takesInput]);
    const theme = cell.getTheme().getValue();
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

    useLayoutEffect(() => {
        props.eGridCell.style.backgroundColor = theme.semanticColors.bodyBackground;
        props.eGridCell.style.color = theme.semanticColors.bodyText;
    }, [props.eGridCell, theme]);

    //a cell inside a cell is two cells for one column of one record
    if (parentCell) {
        throw new Error('Grid.CellRoot cannot be drawn inside another one: a cell is not made of cells.');
    }

    return <GridCellContext.Provider value={cell}>
        <GridCellRevisionContext.Provider value={revision}>
            <ThemeContext theme={theme}>{children}</ThemeContext>
        </GridCellRevisionContext.Provider>
    </GridCellContext.Provider>;
};
