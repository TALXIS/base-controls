import { GridDependency } from "../../core/model/GridDependency";

export class Paging extends GridDependency {

    public get pageNumber() {
        return this._dataset.paging.pageNumber;
    }
    public get pageSize() {
        return this._dataset.paging.pageSize;
    }
    public get totalRecordCount() {
        return this._dataset.paging.totalResultCount;
    }
    public get hasPreviousPage() {
        return this._dataset.paging.hasPreviousPage;
    }
    public get hasNextPage() {
        return this._dataset.paging.hasNextPage;
    }

    public loadNextPage() {
        this.loadExactPage(this.pageNumber + 1)
    }
    public loadPreviousPage() {
        this.loadExactPage(this.pageNumber - 1);
    }
    public loadExactPage(pageNumber: number) {
        this._dataset.paging.loadExactPage(pageNumber);
    }
    public setPageSize(pageSize: number) {
        this._dataset.paging.setPageSize(pageSize);
    }
    public reset() {
        this._dataset.paging.reset();
    }
}