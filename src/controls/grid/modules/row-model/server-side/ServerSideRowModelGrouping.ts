import { ColDef, GridApi, IRowNode } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { IGridRowModelGrouping, IGridRowModelGroupingParameters } from "../interfaces";

/** Grouping where a level is asked for when it is opened. */
export class ServerSideRowModelGrouping implements IGridRowModelGrouping {
    private _isGroupOpenByDefault: (node: IRowNode<IRecord>) => boolean;
    /** What was open before a purge, so the groups the user had opened come back. */
    private _restoredExpandedIds: Set<string> = new Set();

    constructor(parameters: IGridRowModelGroupingParameters) {
        this._isGroupOpenByDefault = parameters.isGroupOpenByDefault;
    }

    public onApplyGridOptions(): void { }

    //AG Grid keeps a `rowGroup` that a new definition leaves out
    public onApplyColumnDefinition(colDef: ColDef<IRecord>, isGrouped: boolean): void {
        colDef.rowGroup = isGrouped;
    }

    //purged: `setExpanded` refreshes the whole store once per node
    public onApplyExpandedLevel(gridApi: GridApi<IRecord>): void {
        gridApi.refreshServerSide({ purge: true });
    }

    public onExpansionChanged(): void {
        this._restoredExpandedIds.clear();
    }

    public isGroupOpenByDefault(node: IRowNode<IRecord>): boolean {
        return (!!node.id && this._restoredExpandedIds.has(node.id)) || this._isGroupOpenByDefault(node);
    }

    public captureExpandedIds(expandedIds: string[]): void {
        this._restoredExpandedIds = new Set(expandedIds);
    }
}
