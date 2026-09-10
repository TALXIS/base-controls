import * as React from "react";
import { AgGridReact, AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";

/** The replaceable parts of the grid. Override through `IGrid.components`. */
export interface IGridComponents {
    /**
     * Renders the AG Grid instance. `props` is every option the grid built for this render, including
     * `onGridReady` — spread it, then add what you need.
     *
     * This is the only way to reach an option AG Grid accepts once, at construction: `treeData`,
     * `getDataPath`, `rowDragText`.
     *
     * Import `AgGridReact` from this package rather than from `@ag-grid-community/react` directly. A
     * second copy of AG Grid cannot see the module registry this one populates, and a grid built against
     * it renders nothing at all.
     */
    onRenderAgGrid: (props: AgGridReactProps<IRecord>) => JSX.Element;
}

/** The defaults for {@link IGridComponents}. */
export const GridComponents: IGridComponents = {
    onRenderAgGrid: (props) => <AgGridReact<IRecord> {...props} />
};
