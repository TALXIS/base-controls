import { IGridColumn } from "../core/interfaces/IGridColumn";

export class SortStatus {
    private _column: IGridColumn;
    private _status: ComponentFramework.PropertyHelper.DataSetApi.SortStatus | undefined;
    private _isAppliedToDataset: boolean;

    constructor(column: IGridColumn, existingStatus?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus) {
        this._column = column;
        this._status = existingStatus
        this._isAppliedToDataset = existingStatus ? true : false;
    }

    public get isAppliedToDataset() {
        return this._isAppliedToDataset;
    }

    public get(): ComponentFramework.PropertyHelper.DataSetApi.SortStatus | undefined {
        return this._status;
    }
    public set(sortDirection: ComponentFramework.PropertyHelper.DataSetApi.Types.SortDirection) {
        if(!this._status) {
            this._status = {
                name: this._column.key,
                sortDirection: sortDirection
            }
        }
        this._status.sortDirection = sortDirection;
    }

}