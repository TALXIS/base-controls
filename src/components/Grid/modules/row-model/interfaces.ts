import type { GridApi } from "@ag-grid-community/core";
import type { AgGridReactProps } from "@ag-grid-community/react";
import type { IRecord } from "@talxis/client-libraries";

/** Which of AG Grid's row models a grid runs on. */
export type IGridRowModelType = 'clientSide' | 'serverSide';

/** How a grid gets its rows, and everything that follows from that choice. */
export interface IGridRowModel {
    /** The options the grid has to be created with. */
    getInitialComponentProps: () => Partial<AgGridReactProps<IRecord>>;
    /** The options that can only be handed to a grid that exists. */
    applyGridOptions: (gridApi: GridApi<IRecord>) => void;
    /** New data landed: hand the rows over, or ask for them again. */
    refresh: (gridApi: GridApi<IRecord>) => void;
    /** Makes a change made to node expansion visible. */
    applyExpansionChange: (gridApi: GridApi<IRecord>) => void;
    /** Puts a set of selected records onto the rows. */
    setSelectedRecordIds: (gridApi: GridApi<IRecord>, recordIds: string[]) => void;
    /** Which records the grid itself has selected. */
    getSelectedRecordIds: (gridApi: GridApi<IRecord>) => string[];
}
