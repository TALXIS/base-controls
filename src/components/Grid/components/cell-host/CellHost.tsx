import { useLayoutEffect, useMemo } from "react";
import { useGridService } from "../../useGridService";
import { GridCellContext } from "./context";
import { ICellProps } from "../interfaces";

export interface ICellHostProps extends ICellProps {
    children?: React.ReactNode;
}

/**
 * The cell everything is drawn inside.
 *
 * Draws nothing itself: it creates the `GridCell` its children belong to, registers it as rendered, and
 * destroys it when it unmounts. A renderer, an editor or a module's own cell that does not render through
 * this has no cell, and `useGridCell` says so.
 */
export const CellHost = (props: ICellHostProps) => {
    const { data: record, children } = props;
    const columnName = props.column!.getColId();
    const cells = useGridService('cells');
    const cell = useMemo(() => cells.createCell(record, columnName), [cells, record, columnName]);

    //registered in a layout effect rather than in the render: a render React throws away must not leave a
    //cell in the registry with nothing left to unmount it
    useLayoutEffect(() => {
        cells.addCell(cell);
        return () => cells.removeCell(cell);
    }, [cells, cell]);

    return <GridCellContext.Provider value={cell}>{children}</GridCellContext.Provider>;
};
