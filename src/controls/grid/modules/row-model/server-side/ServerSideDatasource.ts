import { IServerSideDatasource, IServerSideGetRowsParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
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
                //a load of the main dataset drops the groups' providers
                if (records.length === 0) {
                    records = await groupDataProvider.refresh();
                }
            }
            catch (err) { }
            if (groupDataProvider.isError()) {
                params.fail();
            }
            else {
                params.success(getBlock(records, params));
            }
        }
        else {
            params.success(getBlock(records, params));
        }
    }
}

//AG Grid builds a node for every row it is handed
const getBlock = (records: IRecord[], params: IServerSideGetRowsParams) => ({
    rowData: records.slice(params.request.startRow ?? 0, params.request.endRow ?? records.length),
    rowCount: records.length,
});