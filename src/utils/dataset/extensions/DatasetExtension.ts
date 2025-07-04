import { IDataset } from "@talxis/client-libraries";

export class DatasetExtension {
    private _getDataset: () => IDataset;
    constructor(getDataset: () => IDataset) {
        this._getDataset = getDataset;
    }

    protected get _dataset() {
        return this._getDataset();
    }
}