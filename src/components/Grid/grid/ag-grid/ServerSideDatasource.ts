import { IServerSideDatasource, IServerSideGetRowsParams } from "@ag-grid-community/core";
import { AgGridModel } from "./AgGridModel";
import { IDataProvider, IRecord } from "@talxis/client-libraries";

export class ServerSideDatasource implements IServerSideDatasource {
    private _agGrid: AgGridModel

    constructor(agGrid: AgGridModel) {
        this._agGrid = agGrid;

    }
    public async getRows(params: IServerSideGetRowsParams): Promise<void> {
        const dataset = this._agGrid.getGrid().getDataset();
        const records = dataset.getRecords();
        if (params.request.groupKeys.length > 0) {
            const groupDataProvider = dataset.getDataProvider().createGroupedRecordDataProvider(params.parentNode.data);
            let records: IRecord[] = groupDataProvider.getRecords();
            try {
                //clear selected records means the main dataset has been refreshed
                if (records.length === 0 || dataset.getSelectedRecordIds().length === 0) {
                    records = await groupDataProvider.refresh();
                }
            }
            catch (err) { }
            if (groupDataProvider.isError()) {
                params.fail();
            }
            else {
                params.success({
                    rowData: records,
                    rowCount: records.length
                })
            }
        }
        else {
            params.success({
                rowData: records,
                rowCount: records.length
            })
        }
    }
}