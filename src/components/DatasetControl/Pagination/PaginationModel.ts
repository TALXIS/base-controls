import { IDataset } from "@talxis/client-libraries";
import { DatasetControlModel } from "../DatasetControlModel";

export class PaginationModel {
    private _model: DatasetControlModel;
    constructor(model: DatasetControlModel) {
        this._model = model;
    }

    public toString(): string {
        if (this._paging.totalResultCount === undefined) {
            return this._model.getLabels()['paging-pages']({ start: this._getPageFirstRecordOrder(), end: this._getPageLastRecordOrder() })
        }
        return `${this._model.getLabels()['paging-pages']({ start: this._getPageFirstRecordOrder(), end: this._getPageLastRecordOrder()})} ${this._model.getLabels()['paging-pages-totalcount']({ recordcount: this._getFormattedTotalResultCount() })}`
    }

    private _getPageFirstRecordOrder() {
        if(this._model.getDatasetControl().getDataset().sortedRecordIds.length === 0) {
            return 0;
        }
        return (this._paging.pageNumber - 1) * this._paging.pageSize + 1;
    }

    private _getFormattedTotalResultCount(): string {
        if (this._paging.totalResultCount === undefined) {
            return '';
        }
        if (this._paging.totalResultCount === -1) {
            return '5000+';
        }
        return this._paging.totalResultCount.toString();
    }
    private _getPageLastRecordOrder(): string {
        const count = this._paging.pageNumber * this._paging.pageSize;
        if (this._paging.totalResultCount === undefined) {
            if (this._paging.hasNextPage) {
                return `${count}+`;
            }
            return `${count - this._paging.pageSize + this._model.getDatasetControl().getDataset().sortedRecordIds.length}`

        }
        if (count > this._paging.totalResultCount && this._paging.totalResultCount !== -1) {
            return this._paging.totalResultCount.toString();
        }
        return count.toString();
    }

    private get _paging() {
        return this._model.getDatasetControl().getDataset().paging;
    }

}