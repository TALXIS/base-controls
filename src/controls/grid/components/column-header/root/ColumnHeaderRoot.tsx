import { useMemo } from "react";
import { Column } from "@ag-grid-community/core";
import { useGridService } from "../../../useGridService";
import { GridColumnHeaderContext } from "./context";

/**
 * What a column header is drawn from, of everything AG Grid hands a header component.
 *
 * AG Grid hands its components a great deal more than this; a header reads the column, for its definition,
 * and the element it is drawn in, for what takes the focus and what a menu is drawn against.
 */
export interface IColumnHeaderParams {
    /** The column AG Grid is drawing, which is what its definition is read from. */
    column: Column;
    /** The element AG Grid draws the header in. */
    eGridHeader?: HTMLElement;
}

export interface IColumnHeaderRootProps extends IColumnHeaderParams {
    children?: React.ReactNode;
}

/**
 * What makes a header a header of this grid: everything drawn inside it belongs to one column.
 *
 * The pieces nest in this order:
 *
 * ```tsx
 * <Grid.ColumnHeader.Root {...props}>
 *     <Grid.ColumnHeader.Theme>
 *         <Grid.ColumnHeader.Container>
 *             <Grid.ColumnHeader.Prefix />
 *             <Grid.ColumnHeader.Content>
 *                 <Grid.ColumnHeader.Label />
 *                 <Grid.ColumnHeader.RequiredMarker />
 *             </Grid.ColumnHeader.Content>
 *             <Grid.ColumnHeader.Suffix />
 *         </Grid.ColumnHeader.Container>
 *         <Grid.ColumnHeader.Menu />          //outside the container: what it opens is drawn over the grid
 *     </Grid.ColumnHeader.Theme>
 * </Grid.ColumnHeader.Root>
 * ```
 */
export const ColumnHeaderRoot = (props: IColumnHeaderRootProps) => {
    const headers = useGridService('columns').headers;
    const header = useMemo(
        () => headers.createHeader({ column: props.column, element: props.eGridHeader }),
        [headers, props.column, props.eGridHeader]);

    return <GridColumnHeaderContext.Provider value={header}>{props.children}</GridColumnHeaderContext.Provider>;
};
