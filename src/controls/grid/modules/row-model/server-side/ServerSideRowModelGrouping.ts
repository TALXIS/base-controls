import { ColDef, IRowNode } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { IGridRowModelGrouping, IGridRowModelGroupingParameters } from "../../../runtime/row-model";

/** Grouping where a level is asked for when it is opened. */
export class ServerSideRowModelGrouping implements IGridRowModelGrouping {
    public isGroupOpenByDefault: (node: IRowNode<IRecord>) => boolean;

    constructor(parameters: IGridRowModelGroupingParameters) {
        this.isGroupOpenByDefault = parameters.isGroupOpenByDefault;
    }

    public applyAgGridOptions(): void { }

    //AG Grid keeps a `rowGroup` that a new definition leaves out
    public applyColumnDefinition(colDef: ColDef<IRecord>, isGrouped: boolean): void {
        colDef.rowGroup = isGrouped;
        const getValue = colDef.valueGetter;
        if (isGrouped && typeof getValue === 'function') {
            //a server-side group is keyed by its value, and AG Grid refuses an empty key
            colDef.valueGetter = params => {
                const value = getValue(params);
                return params.node?.group ? value ?? '' : value;
            };
        }
    }
}
