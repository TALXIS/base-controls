import { useLayoutEffect, useMemo } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { ThemeContext } from "@utils";
import { IGridRowsEvents } from "../../../services/rows";
import { useGridService } from "../../../useGridService";
import { CellUi } from "../ui";
import { GridCellContext } from "./context";

export interface IGridCellRootProps extends ICellRendererParams {
    children?: React.ReactNode;
}

/**
 * The cell everything else is drawn inside.
 *
 * Creates the `GridCell` its children belong to, registers it as rendered, destroys it when it unmounts,
 * and draws the surface that cell is on. What goes in it is the caller's: `Grid.FieldCell` and `Grid.Cell`
 * are the two ready-made answers. Anything drawn outside one of these has no cell, and `useGridCell`
 * says so.
 */
export const CellRoot = (props: IGridCellRootProps) => {
    const { data: record, children } = props;
    const cells = useGridService('cells');
    const rows = useGridService('rows');
    const rerender = useRerender();
    const colDef = props.colDef!;
    const cell = useMemo(() => cells.createCell(record, colDef), [cells, record, colDef]);

    useLayoutEffect(() => {
        cells.addCell(cell);
        return () => cells.removeCell(cell);
    }, [cells, cell]);

    //a height set anywhere else - another cell of the same row being dragged - is this cell's height too
    useEventEmitter<IGridRowsEvents>(rows, 'onRowHeightChanged', (changed: IRecord) => {
        if (changed.getRecordId() === record.getRecordId()) {
            rerender();
        }
    });

    const theme = cell.getTheme().getValue();

    const getContainer = () => <CellUi.Container>
        {cell.isLoading() ? <CellUi.Loading /> : children}
    </CellUi.Container>;

    const getContent = () => {
        if (!colDef.autoHeight) {
            return getContainer();
        }
        return <CellUi.RowResizeGrip
            height={rows.getHeight(record)}
            onResizeEnd={height => rows.setHeight(record, height)}>
            {getContainer()}
        </CellUi.RowResizeGrip>;
    };

    return <GridCellContext.Provider value={cell}>
        <ThemeContext theme={theme}>{getContent()}</ThemeContext>
    </GridCellContext.Provider>;
};
