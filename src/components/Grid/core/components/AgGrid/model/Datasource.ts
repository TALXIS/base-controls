import { IServerSideDatasource } from "@ag-grid-community/core";
import { IDataset } from "@talxis/client-libraries";

export class Datasource implements IServerSideDatasource {
    private _getDataset: () => IDataset;
    constructor(onGetDataset: () => IDataset) {
        this._getDataset = onGetDataset;

    }
    public getRows() {
        return [];
    }
}