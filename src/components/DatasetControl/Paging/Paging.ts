import { IDataset } from "@talxis/client-libraries";
import { IDatasetPagingParameters } from "./interfaces";
import { ITranslation } from "../../../hooks";
import { datasetPagingTranslations } from "./translations";

type ILabels = Required<ITranslation<typeof datasetPagingTranslations>>;

export class Paging {
    private _getParameters: () => IDatasetPagingParameters;
    private _getLabels: () => ILabels

    constructor(getParameters: () => IDatasetPagingParameters, getLabels: () => ILabels) {
        this._getParameters = getParameters;
        this._getLabels = getLabels;
    }

    public get pageNumber() {
        return this._getDataset().paging.pageNumber
    }
    public get pageSize() {
        return this._getDataset().paging.pageSize
    }
    public get totalResultCount() {
        return this._getDataset().paging.totalResultCount
    }
    public get hasPreviousPage() {
        return this._getDataset().paging.hasPreviousPage
    }
    public get hasNextPage() {
        return this._getDataset().paging.hasNextPage
    }
    public get pageFirstRecordOrder() {
        if (this._getDataset().sortedRecordIds.length === 0) {
            return 0;
        }
        return (this.pageNumber - 1) * this.pageSize + (this.totalResultCount === 0 ? 0 : 1);
    }
    public get formattedTotalResultCount(): string {
        if (this.totalResultCount === undefined) {
            return '';
        }
        if (this.totalResultCount === -1) {
            return '5000+';
        }
        return this.totalResultCount.toString();
    }
    public get pageLastRecordOrder(): string {
        const count = this.pageNumber * this.pageSize;
        if (this.totalResultCount === undefined) {
            if (this.hasNextPage) {
                return `${count}+`;
            }
            return `${count - this.pageSize + this._getDataset().sortedRecordIds.length}`

        }
        if (count > this.totalResultCount && this.totalResultCount !== -1) {
            return this.totalResultCount.toString();
        }
        return count.toString();
    }

    public get isEnabled() {
        return this._getParameters()?.EnablePagination?.raw !== false;
    }

    public loadNextPage() {
        this.loadExactPage(this.pageNumber + 1)
    }
    public loadPreviousPage() {
        this.loadExactPage(this.pageNumber - 1);
    }
    public loadExactPage(pageNumber: number) {
        this._getDataset().paging.loadExactPage(pageNumber);
    }
    public setPageSize(pageSize: number) {
        this._getDataset().paging.setPageSize(pageSize);
        this._getDataset().refresh();
    }
    public reset() {
        this._getDataset().paging.reset();
    }

    public toString(): string {
        if (this.totalResultCount === undefined) {
            return this._getLabels()['paging-pages']({ start: this.pageFirstRecordOrder, end: this.pageLastRecordOrder })
        }
        return `${this._getLabels()['paging-pages']({ start: this.pageFirstRecordOrder, end: this.pageLastRecordOrder })} ${this._getLabels()['paging-pages-totalcount']({ recordcount: this.formattedTotalResultCount })}`
    }

    private _getDataset(): IDataset {
        return this._getParameters().Dataset;
    }
}