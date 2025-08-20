import { IServerSideDatasource, IServerSideGetRowsParams } from "@ag-grid-community/core";
import { AgGridModel } from "./AgGridModel";
import { IDataProvider, IRecord } from "@talxis/client-libraries";

export class ServerSideDatasource implements IServerSideDatasource {
    private _agGrid: AgGridModel

    constructor(agGrid: AgGridModel) {
        this._agGrid = agGrid;

    }
    public async getRows(params: IServerSideGetRowsParams): Promise<void> {
        const records = this._agGrid.getGrid().getDataset().getDataProvider().getRecords();
        if (params.request.groupKeys.length > 0) {
            const groupDataProvider = this._agGrid.getGrid().getGroupChildrenDataProvider(params.parentNode.data);
            const enableRecordSelectionClearing = this._preventRecordSelectionClearing(groupDataProvider);
            let records: IRecord[] = [];
            try {
                records = await groupDataProvider.refresh();
            }
            catch (err) { }
            enableRecordSelectionClearing();
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

    private _preventRecordSelectionClearing(dataProvider: IDataProvider) {
        const originalClearSelectedRecords = dataProvider.clearSelectedRecordIds;
        dataProvider.clearSelectedRecordIds = () => {
            // Do nothing to prevent clearing selected records
        }
        return () => {
            dataProvider.clearSelectedRecordIds = originalClearSelectedRecords;
        }
    }
}