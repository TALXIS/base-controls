import type { ColDef, GridApi, IRowNode } from "@ag-grid-community/core";
import type { IRecord } from "@talxis/client-libraries";
import type { IGridAgGridOptions } from "../../services/runtime";

/** Which of AG Grid's row models a grid runs on. */
export type IGridRowModelType = 'clientSide' | 'serverSide';

/** How a grid gets its rows, and everything that follows from that choice. */
export interface IGridRowModel {
    readonly type: IGridRowModelType;
    /** New data landed and its columns are applied: hand the rows over, or ask for them again. */
    refresh: () => void;
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
    onAgGridOptions: (result: IGridAgGridOptions) => void;
    /** What a data column needs for this row model, grouped or not. */
    onApplyColumnDefinition: (colDef: ColDef<IRecord>, isGrouped: boolean) => void;
    /** Opens and closes the groups to what `isGroupOpenByDefault` now says. */
    onApplyExpandedLevel: (gridApi: GridApi<IRecord>) => void;
    /** The user or a level decided what is open, which outranks what a reload restored. */
    onExpansionChanged: () => void;
}
