import { useLayoutEffect, useMemo } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
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
    const columnName = props.column!.getColId();
    const cells = useGridService('cells');
    const components = { ...CellHostComponents, ...componentOverrides };
    const cell = useMemo(() => cells.createCell(record, columnName), [cells, record, columnName]);
    const theme = cell.getTheme();

    //registered in a layout effect rather than in the render: a render React throws away must not leave a
    //cell in the registry with nothing left to unmount it
    useLayoutEffect(() => {
        cells.addCell(cell);
        return () => cells.removeCell(cell);
    }, [cells, cell]);

    //no theme where the cell is drawn in the grid's own: the container then passes down whatever it
    //inherits rather than replacing it with a copy nothing asked for
    return <GridCellContext.Provider value={cell}>
        {components.onRenderContainer({ theme: theme.isCustom() ? theme.getValue() : undefined, children: children })}
    </GridCellContext.Provider>;
};
