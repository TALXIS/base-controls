import { Grid } from "./Grid";

export class GridDependency {
    protected _grid: Grid;
    protected _refreshCallbacks: Map<string, () => any> = new Map();
    
    constructor(grid: Grid) {
        this._grid = grid;
    }

    public addRefreshCallback(id: string, callback: () => any) {
        this._refreshCallbacks.set(id, callback);
    }

    public removeRefreshCallback(id: string) {
        this._refreshCallbacks.delete(id);
    }

    public onDependenciesUpdated() {

    }

    protected _triggerRefreshCallbacks() {
        for(const refreshCallback of this._refreshCallbacks.values()) {
            refreshCallback();
        }
    }
    protected get _dataset() {
        return this._grid.dataset;
    }
    protected get _pcfContext() {
        return this._grid.pcfContext;
    }
}