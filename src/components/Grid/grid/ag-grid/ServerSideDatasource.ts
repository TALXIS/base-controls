import { IServerSideDatasource, IServerSideGetRowsParams } from "@ag-grid-community/core";
import { AgGridModel } from "./AgGridModel";

export class ServerSideDatasource implements IServerSideDatasource {
    private _agGrid: AgGridModel

    constructor(agGrid: AgGridModel) {
        this._agGrid = agGrid;

    }
    public async getRows(params: IServerSideGetRowsParams): Promise<void> {
        const records = this._agGrid.getGrid().getDataset().getDataProvider().getRecords();
        if (params.request.groupKeys.length > 0) {
            const groupDataProvider = this._agGrid.getGrid().getGroupChildrenDataProvider(params.parentNode.data);
            let records = groupDataProvider.getRecords();
            if(records.length === 0) {
                records = await groupDataProvider.refresh();
            }
            params.success({
                rowData: records,
                rowCount: records.length
            })
        }
        else {
            params.success({
                rowData: records,
                rowCount: records.length
            })
        }
    }

}