import { IDataProvider } from "@talxis/client-libraries";
import { QuickFindBase } from "../../quick-find";
import { IDatasetControl } from "../DatasetControl";

export class DatasetControlQuickFind extends QuickFindBase {
    private _provider: IDataProvider;
    private _datasetControl: IDatasetControl;

    constructor(datasetControl: IDatasetControl) {
        super();
        this._datasetControl = datasetControl;
        this._provider = datasetControl.getDataset().getDataProvider();
    }

    public onGetSearchQuery(): string {
        return this._provider.getSearchQuery();
    }
    public onSetSearchQuery(query: string): void {
        this._provider.setSearchQuery(query);
        this._datasetControl.refresh();
    }
    public onGetColumnNames(): string[] {
        return this._provider.getQuickFindColumns().map(col => col.displayName ?? '');
    }
    
}