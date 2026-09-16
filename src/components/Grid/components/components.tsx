import * as React from "react";
import { AgGridReact, AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";

/** The replaceable parts of the grid. */
export interface IGridComponents {
    /** Renders the AG Grid instance. */
    onRenderAgGrid: (props: AgGridReactProps<IRecord>) => JSX.Element;
}

/** The defaults for {@link IGridComponents}. */
export const GridComponents: IGridComponents = {
    onRenderAgGrid: (props) => <AgGridReact<IRecord> {...props} />
};
