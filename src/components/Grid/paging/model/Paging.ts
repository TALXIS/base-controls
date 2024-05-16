import { GridDependency } from "../../core/model/GridDependency";

export class Paging extends GridDependency {

    public get pageNumber() {
        return this._dataset.paging.pageNumber;
    }
    public get pageSize() {
        return this._dataset.paging.pageSize;
    }
    public get totalResultCount() {
        return this._dataset.paging.totalResultCount;
    }
    public get hasPreviousPage() {
        return this._dataset.paging.hasPreviousPage;
    }
    public get hasNextPage() {
        return this._dataset.paging.hasNextPage;
    }
    public get pageFirstRecordOrder() {
        return (this.pageNumber - 1) * this.pageSize + (this.totalResultCount === 0 ? 0 : 1);
    }

    public get pageLastRecordOrder() {
        return this.pageNumber * this.pageSize;
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
        this._dataset.refresh();
        //in Power Apps the new page size can sometimes come only after second refresh #smh
        //@ts-ignore - Portal types
        if (!window.TALXIS?.Portal) {
            this._dataset.refresh()
        }
    }
    public reset() {
        this._dataset.paging.reset();
    }
}