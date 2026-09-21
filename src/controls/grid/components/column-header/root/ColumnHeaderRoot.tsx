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
export interface IGridColumnHeaderParams {
    /** The column AG Grid is drawing, which is what its definition is read from. */
    column: Column;
    /** The element AG Grid draws the header in. */
    eGridHeader?: HTMLElement;
}

export interface IGridColumnHeaderRootProps extends IGridColumnHeaderParams {
    children?: React.ReactNode;
}

/**
 * What makes a header a header of this grid: everything drawn inside it belongs to one column.
 *
 * The pieces nest in this order:
 *
 * ```tsx
 * <Grid.ColumnHeaderRoot {...props}>
 *     <Grid.ColumnHeaderTheme>
 *         <Grid.ColumnHeaderContainer>
 *             <Grid.ColumnHeaderPrefix />
 *             <Grid.ColumnHeaderContent>
 *                 <Grid.ColumnHeaderLabel />
 *                 <Grid.ColumnHeaderRequiredMarker />
 *             </Grid.ColumnHeaderContent>
 *             <Grid.ColumnHeaderSuffix />
 *         </Grid.ColumnHeaderContainer>
 *         <Grid.ColumnHeaderMenu />          //outside the container: what it opens is drawn over the grid
 *     </Grid.ColumnHeaderTheme>
 * </Grid.ColumnHeaderRoot>
 * ```
 */
export const ColumnHeaderRoot = (props: IGridColumnHeaderRootProps) => {
    const headers = useGridService('columnHeaders');
    const header = useMemo(
        () => headers.createHeader({ column: props.column, element: props.eGridHeader }),
        [headers, props.column, props.eGridHeader]);

    return <GridColumnHeaderContext.Provider value={header}>{props.children}</GridColumnHeaderContext.Provider>;
};
