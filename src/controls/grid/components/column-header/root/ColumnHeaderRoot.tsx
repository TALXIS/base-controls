import { useMemo } from "react";
import { Column } from "ag-grid-community";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useRerender } from "@legacy";
import { useGridService } from "../../../useGridService";
import { IGridColumnHeadersEvents } from "../../../services/column-header";
import { GridColumnHeaderContext, GridColumnHeaderRevisionContext } from "./context";

/** What a column header is drawn from, of everything AG Grid hands a header component. */
export interface IColumnHeaderParams {
    /** The column AG Grid is drawing, read for its definition. */
    column: Column;
    /** The element AG Grid draws the header in. */
    eGridHeader?: HTMLElement;
}

export interface IColumnHeaderRootProps extends IColumnHeaderParams {
    children?: React.ReactNode;
}

/** What makes a header a header of this grid: everything inside it belongs to one column. */
export const ColumnHeaderRoot = (props: IColumnHeaderRootProps) => {
    const headers = useGridService('columns').headers;
    const header = useMemo(
        () => headers.createHeader({ column: props.column, element: props.eGridHeader }),
        [headers, props.column, props.eGridHeader]);
    const { rerender: redraw, revision } = useRerender();

    useEventEmitter<IGridColumnHeadersEvents>(headers.events, 'onRenderRequested', redraw);

    return <GridColumnHeaderContext.Provider value={header}>
        <GridColumnHeaderRevisionContext.Provider value={revision}>{props.children}</GridColumnHeaderRevisionContext.Provider>
    </GridColumnHeaderContext.Provider>;
};
