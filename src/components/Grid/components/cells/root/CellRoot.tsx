import { useContext, useLayoutEffect, useMemo } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { ThemeContext } from "@utils";
import { useGridService } from "../../../useGridService";
import { GridCellContext } from "./context";

export interface IGridCellRootProps extends ICellRendererParams {
    children?: React.ReactNode;
}

/**
 * What makes a cell a cell of this grid: everything drawn inside it belongs to one `GridCell`.
 *
 * Creates that cell, registers it as rendered, destroys it when it unmounts, and puts it and its theme
 * where the rest can reach them - which is why it is the only piece a caller hands AG Grid's parameters
 * to. It draws nothing itself: `Grid.CellContainer` is the element, and everything else is a piece inside
 * that. A component drawn outside a cell root has no cell, and `useGridCell` says so.
 */
export const CellRoot = (props: IGridCellRootProps) => {
    const { data: record, children } = props;
    const cells = useGridService('cells');
    const parentCell = useContext(GridCellContext);
    const colDef = props.colDef!;
    const cell = useMemo(() => cells.createCell(record, colDef, props.node), [cells, record, colDef, props.node]);

    useLayoutEffect(() => {
        cells.addCell(cell);
        return () => cells.removeCell(cell);
    }, [cells, cell]);

    //a cell inside a cell is two cells for one column of one record, and everything that reaches for the
    //cell it is drawn in would reach the wrong one
    if (parentCell) {
        throw new Error('Grid.CellRoot cannot be drawn inside another one: a cell is not made of cells.');
    }

    return <GridCellContext.Provider value={cell}>
        <ThemeContext theme={cell.getTheme().getValue()}>{children}</ThemeContext>
    </GridCellContext.Provider>;
};
