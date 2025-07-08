import { IServerSideDatasource, IServerSideGetRowsParams } from "@ag-grid-community/core";
import { AgGridModel } from "./AgGridModel";

export class ServerSideDatasource implements IServerSideDatasource {
    private _agGrid: AgGridModel

    constructor(agGrid: AgGridModel) {
        this._agGrid = agGrid;

    }
    public getRows(params: IServerSideGetRowsParams): void {
        const records = this.getDataset().getDataProvider().getRecords();
        params.success({
            rowData: records,
            rowCount: records.length
        })
    }

    public getDataset() {
        return this._agGrid.getGrid().getDataset();
    }

}