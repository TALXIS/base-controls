import { ColDef } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { IGroupingStrategy } from "./interfaces";

/**
 * Grouping where a level is asked for when it is opened.
 *
 * There is next to nothing here because the mechanism is `ServerSideDatasource`: it answers a request
 * carrying the keys of the group that was expanded, and `rowGroup` is what puts those keys in the request.
 */
export class ServerSideGroupingStrategy implements IGroupingStrategy {
    public applyGridOptions(): void { }

    public applyGroupedColumnDefinition(colDef: ColDef<IRecord>): void {
        colDef.rowGroup = true;
    }

    /** The datasource answers with the rows, so there are none to hand over. */
    public getRows(): undefined {
        return undefined;
    }
}
