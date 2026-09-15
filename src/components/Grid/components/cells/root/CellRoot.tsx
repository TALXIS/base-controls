import { useContext, useLayoutEffect, useMemo, useState } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecordEvents } from "@talxis/client-libraries";
import { ThemeContext } from "@utils";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { IGridCellRendererParams } from "../../interfaces";
import { useGridService } from "../../../useGridService";
import { GridCellContext, GridCellRevisionContext } from "./context";

//a constant rather than an array built per render: `useEventEmitter` keys its subscription on what it is
//given, and every cell of the grid subscribes here
const RECORD_EVENTS: (keyof IRecordEvents)[] = ['onFieldValueChanged', 'onAfterSaved'];

export interface IGridCellRootProps extends ICellRendererParams, IGridCellRendererParams {
    children?: React.ReactNode;
}

/**
 * What makes a cell a cell of this grid: everything drawn inside it belongs to one `GridCell`.
 *
 * Creates that cell, registers it as rendered, destroys it when it unmounts, and puts it and its theme
 * where the rest can reach them - which is why it is the only piece a caller hands AG Grid's parameters
 * to, and why whether the cell takes input is read here rather than passed down. It draws nothing itself: `Grid.CellContainer` is the element, and everything else is a piece inside
 * that. A component drawn outside a cell root has no cell, and `useGridCell` says so.
 */
export const CellRoot = (props: IGridCellRootProps) => {
    const { data: record, children } = props;
    const cells = useGridService('cells');
    const parentCell = useContext(GridCellContext);
    const colDef = props.colDef!;
    const cell = useMemo(() => cells.createCell(record, colDef, props.node, props.editing), [cells, record, colDef, props.node, props.editing]);
    const theme = cell.getTheme().getValue();
    const [revision, setRevision] = useState(() => Symbol('cellRevision'));

    //the whole cell, on any change to the record rather than to this column: what a cell answers its hooks
    //is the record's, so a value that decides whether another cell may be edited, what it is drawn in, or
    //what its control is handed, changes what this cell draws too
    useEventEmitter<IRecordEvents>(record, RECORD_EVENTS, () => {
        setRevision(Symbol('cellRevision'));
    });

    useLayoutEffect(() => {
        cells.addCell(cell);
        return () => cells.removeCell(cell);
    }, [cells, cell]);

    useLayoutEffect(() => {
        props.eGridCell.style.backgroundColor = theme.semanticColors.bodyBackground;
        props.eGridCell.style.color = theme.semanticColors.bodyText;
    }, [props.eGridCell, theme]);

    //a cell inside a cell is two cells for one column of one record, and everything that reaches for the
    //cell it is drawn in would reach the wrong one
    if (parentCell) {
        throw new Error('Grid.CellRoot cannot be drawn inside another one: a cell is not made of cells.');
    }

    return <GridCellContext.Provider value={cell}>
        <GridCellRevisionContext.Provider value={revision}>
            <ThemeContext theme={theme}>{children}</ThemeContext>
        </GridCellRevisionContext.Provider>
    </GridCellContext.Provider>;
};
