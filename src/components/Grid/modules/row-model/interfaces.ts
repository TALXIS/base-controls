import type { GridApi } from "@ag-grid-community/core";
import type { AgGridReactProps } from "@ag-grid-community/react";
import type { IRecord } from "@talxis/client-libraries";

/** Which of AG Grid's row models a grid runs on. */
export type IGridRowModelType = 'clientSide' | 'serverSide';

/**
 * How a grid gets its rows, and everything that follows from that choice.
 *
 * The two row models take their rows, their refreshes and their selection through different APIs, and
 * calling the wrong one is a silent no-op rather than an error — so the grid asks whichever module it was
 * given instead of branching on the answer in every one of those places.
 *
 * Internal: implemented by the two shipped classes, and a consumer never writes one.
 */
export interface IGridRowModel {
    /**
     * The options the grid has to be created with. Read while the grid renders, so it cannot touch an api.
     */
    getInitialComponentProps: () => Partial<AgGridReactProps<IRecord>>;
    /** The options that can only be handed to a grid that exists. Applied once, after the grid's own. */
    applyGridOptions: (gridApi: GridApi<IRecord>) => void;
    /** New data landed: hand the rows over, or ask for them again. */
    refresh: (gridApi: GridApi<IRecord>) => void;
    /** Puts a set of selected records onto the rows. */
    setSelectedRecordIds: (gridApi: GridApi<IRecord>, recordIds: string[]) => void;
}
