import { useLayoutEffect, useMemo } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { IGridRowsEvents } from "../../services/rows";
import { ThemeContext } from "@utils";
import { Commands } from "../adapters/commands";
import { Control } from "../adapters/control";
import { useGridService } from "../../useGridService";
import { CellHostComponents, ICellHostComponents } from "./components";
import { GridCellContext } from "./context";

export interface ICellHostProps extends ICellRendererParams {
    children?: React.ReactNode;
    components?: Partial<ICellHostComponents>;
}

/**
 * The cell everything is drawn inside.
 *
 * Creates the `GridCell` its children belong to, registers it as rendered, destroys it when it unmounts,
 * and draws the container that cell is in. A renderer, an editor or a module's own cell that does not
 * render through this has no cell, and `useGridCell` says so.
 */
export const CellHost = (props: ICellHostProps) => {
    const { data: record, children, components: componentOverrides } = props;
    const cells = useGridService('cells');
    const rows = useGridService('rows');
    const rerender = useRerender();
    const components = { ...CellHostComponents, ...componentOverrides };
    const colDef = props.colDef!;
    const cell = useMemo(() => cells.createCell(record, colDef), [cells, record, colDef]);
    const theme = cell.getTheme().getValue();

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

    const getContainer = () => components.onRenderContainer({
        //what `applyTo='element'` painted: the cell's surface and the text on it
        style: { backgroundColor: theme.semanticColors.bodyBackground, color: theme.semanticColors.bodyText },
        children: cell.isLoading()
            ? components.onRenderLoading()
            : <><Cell.Control /><Cell.Commands /></>,
    });

    const getContent = () => {
        //`autoHeight` is what lets AG Grid take the row's height from what the cell draws, and dragging a
        //row taller is nothing without it
        if (!colDef.autoHeight || !components.onRenderRowResizeGrip) {
            return getContainer();
        }
        return components.onRenderRowResizeGrip({
            height: rows.getHeight(record),
            onResizeEnd: height => rows.setHeight(record, height),
            children: getContainer(),
        });
    };

    return <GridCellContext.Provider value={cell}>
        <ThemeContext theme={theme}>{getContent()}</ThemeContext>
    </GridCellContext.Provider>;
};

/** The cell, with what a cell can draw of its own hanging off it: `Cell.Control`, `Cell.Commands`. */
export const Cell = Object.assign(CellHost, { Commands: Commands, Control: Control });
