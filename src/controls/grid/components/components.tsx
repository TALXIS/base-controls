import * as React from "react";
import { AgGridReact, AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { CellRenderer, ICellRendererProps } from "./cells/cell-renderer/CellRenderer";
import { CellEditor, ICellEditorProps } from "./cells/cell-editor/CellEditor";
import { CellEmptyRenderer, ICellEmptyRendererProps } from "./cells/empty-cell-renderer/CellEmptyRenderer";
import { ColumnHeaderRenderer, IColumnHeaderRendererProps } from "./column-header/ColumnHeaderRenderer";

/** The replaceable parts of the grid. */
export interface IGridComponents {
    /** Renders the AG Grid instance. */
    onRenderAgGrid: (props: AgGridReactProps<IRecord>) => JSX.Element;
    /** Renders a record's cell; `Grid.Cell.Renderer` is the grid's own, to fall back to. */
    onRenderCellRenderer: (props: ICellRendererProps) => JSX.Element;
    /** Renders a record's cell while it is edited; `Grid.Cell.Editor` is the grid's own. */
    onRenderCellEditor: (props: ICellEditorProps) => JSX.Element;
    /** Renders a cell of a column a hook added; `Grid.Cell.EmptyRenderer` is the grid's own. */
    onRenderEmptyCellRenderer: (props: ICellEmptyRendererProps) => JSX.Element;
    /** Renders a column's header; `Grid.ColumnHeader.Renderer` is the grid's own, to fall back to. */
    onRenderColumnHeader: (props: IColumnHeaderRendererProps) => JSX.Element;
}

/** The defaults for {@link IGridComponents}. */
export const GridComponents: IGridComponents = {
    onRenderAgGrid: (props) => <AgGridReact<IRecord> {...props} />,
    onRenderCellRenderer: (props) => <CellRenderer {...props} />,
    onRenderCellEditor: (props) => <CellEditor {...props} />,
    onRenderEmptyCellRenderer: (props) => <CellEmptyRenderer {...props} />,
    onRenderColumnHeader: (props) => <ColumnHeaderRenderer {...props} />,
};
