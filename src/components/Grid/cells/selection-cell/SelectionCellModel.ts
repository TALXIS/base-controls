import { IRecord } from "@talxis/client-libraries";
import { AgGridModel } from "../../grid/ag-grid/AgGridModel";

interface ISelectionCellModelOptions {
    record: IRecord;
    agGridModel: AgGridModel;
}

export class SelectionCellModel {
    private _record: IRecord;
    constructor(record: IRecord) {
        this._record = record;
    }
    public isLoading(): boolean {
        return this._record.isSaving();
    }
    public getSelectionState(): 'checked' | 'unchecked' | 'intermediate' {
        return 'unchecked';
    }
}