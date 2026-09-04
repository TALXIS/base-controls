import { IServerSideDatasource, IServerSideGetRowsParams } from "@ag-grid-community/core";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../../services";

export class ServerSideDatasource implements IServerSideDatasource {
    private _services: IGridServiceLocator;

    constructor(services: IGridServiceLocator) {
        this._services = services;
    }

    public async getRows(params: IServerSideGetRowsParams): Promise<void> {
        const provider = this._services.get('provider');
        const records = provider.getRecords();
        if (params.request.groupKeys.length > 0) {
            const groupDataProvider = provider.createGroupedRecordDataProvider(params.parentNode.data);
            let records: IRecord[] = groupDataProvider.getRecords();
            try {
                //clear selected records means the main dataset has been refreshed
                if (records.length === 0 || provider.getSelectedRecordIds().length === 0) {
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