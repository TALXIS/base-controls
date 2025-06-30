import { IServerSideDatasource, IServerSideGetRowsParams } from "@ag-grid-community/core";
import { AgGrid } from "./AgGrid";

export class Datasource implements IServerSideDatasource {
    private _agGrid: AgGrid

    constructor(agGrid: AgGrid) {
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