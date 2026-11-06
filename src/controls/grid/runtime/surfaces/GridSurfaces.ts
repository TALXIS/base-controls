import { HookRegistry } from "@core";

/** Something a module draws over the grid. */
export interface IGridSurface {
    key: string;
    /** What it draws, or `null` while the module has nothing to show. */
    onRender: () => JSX.Element | null;
}

/** A hook over what the modules draw over the grid. */
export type GridSurfacesHook = (surfaces: IGridSurface[]) => void;

/** What the modules draw over the grid, assembled from what they added. */
export interface IGridSurfaces {
    /**
     * Adds a hook over what the modules draw over the grid.
     *
     * @param priority Ascending: a higher number runs later.
     */
    addSurfacesHook(hook: GridSurfacesHook, priority?: number): () => void;
}

/** What the grid's own parts read of it. */
export interface IGridSurfacesInternal extends IGridSurfaces {
    /** Everything the modules draw over the grid, in order. */
    getSurfaces(): IGridSurface[];
}

export class GridSurfaces implements IGridSurfacesInternal {
    private _surfaceHooks = new HookRegistry<GridSurfacesHook>();

    public addSurfacesHook(hook: GridSurfacesHook, priority?: number): () => void {
        return this._surfaceHooks.add(hook, priority);
    }

    public getSurfaces(): IGridSurface[] {
        const surfaces: IGridSurface[] = [];
        this._surfaceHooks.apply(surfaces);
        return surfaces;
    }
}


