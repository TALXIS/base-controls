import { ColDef, GridApi, IRowNode } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { IGridRowModelGrouping, IGridRowModelGroupingParameters } from "../../../services/row-model";

/** Grouping where a level is asked for when it is opened. */
export class ServerSideRowModelGrouping implements IGridRowModelGrouping {
    public isGroupOpenByDefault: (node: IRowNode<IRecord>) => boolean;

    constructor(parameters: IGridRowModelGroupingParameters) {
        this.isGroupOpenByDefault = parameters.isGroupOpenByDefault;
    }

    public onAgGridOptions(): void { }

    //AG Grid keeps a `rowGroup` that a new definition leaves out
    public onApplyColumnDefinition(colDef: ColDef<IRecord>, isGrouped: boolean): void {
        colDef.rowGroup = isGrouped;
    }

    //purged: `setExpanded` refreshes the whole store once per node
    public onApplyExpandedLevel(gridApi: GridApi<IRecord>): void {
        //AG Grid remembers each group's `isServerSideGroupOpenByDefault` answer across a purge
        gridApi.resetRowGroupExpansion();
        gridApi.refreshServerSide({ purge: true });
    }

    public onExpansionChanged(): void { }
}
