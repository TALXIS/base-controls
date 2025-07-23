import { IDataProvider } from "@talxis/client-libraries";

export class DataProviderExtension {
    private _getDataProvider: () => IDataProvider;
    constructor(getDataProvider: () => IDataProvider) {
        this._getDataProvider = getDataProvider
    }

    protected get _dataProvider() {
        return this._getDataProvider();
    }
}