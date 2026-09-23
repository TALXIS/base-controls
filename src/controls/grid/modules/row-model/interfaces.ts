import type { ColDef, GridApi, IRowNode } from "@ag-grid-community/core";
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
    /** The part of grouping that depends on how the rows arrive. */
    createGrouping: (parameters: IGridRowModelGroupingParameters) => IGridRowModelGrouping;
    /** Puts a set of selected records onto the rows. */
    setSelectedRecordIds: (gridApi: GridApi<IRecord>, recordIds: string[]) => void;
    /** Which records the grid itself has selected. */
    getSelectedRecordIds: (gridApi: GridApi<IRecord>) => string[];
}

export interface IGridRowModelGroupingParameters {
    /** Whether a group row opens itself when it first appears. */
    isGroupOpenByDefault: (node: IRowNode<IRecord>) => boolean;
}

/** What grouping asks of the row model it runs on. */
export interface IGridRowModelGrouping {
    /** Options only this row model needs while the rows can be grouped. */
    onApplyGridOptions: (gridApi: GridApi<IRecord>) => void;
    /** What a grouped column needs beyond being moved to the front and pinned. */
    onApplyGroupedColumnDefinition: (colDef: ColDef<IRecord>) => void;
    /** Opens and closes the groups to what `isGroupOpenByDefault` now says. */
    onApplyExpandedLevel: (gridApi: GridApi<IRecord>) => void;
    /** The user or a level decided what is open, which outranks what a reload restored. */
    onExpansionChanged: () => void;
}
