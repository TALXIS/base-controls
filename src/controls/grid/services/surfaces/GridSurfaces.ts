import { HookRegistry } from "@utils";

/** Something a module draws over the grid. */
export interface IGridSurface {
    key: string;
    /** What it draws, or `null` while the module has nothing to show. */
    onRender: () => JSX.Element | null;
}

/** A hook over what the modules draw over the grid. */
export type GridSurfacesHook = (surfaces: IGridSurface[]) => void;

/** What the modules draw over the grid, assembled from what they registered. */
export interface IGridSurfaces {
    /**
     * Registers a hook over what the modules draw over the grid.
     *
     * @param priority Ascending: a lower number is drawn first.
     */
    registerSurface(hook: GridSurfacesHook, priority?: number): () => void;
}

/** What the grid's own parts read of it. */
export interface IGridSurfacesInternal extends IGridSurfaces {
    /** Everything the modules draw over the grid, in order. */
    getSurfaces(): IGridSurface[];
}

export class GridSurfaces implements IGridSurfacesInternal {
    private _surfaceHooks = new HookRegistry<GridSurfacesHook>();

    public registerSurface(hook: GridSurfacesHook, priority?: number): () => void {
        return this._surfaceHooks.register(hook, priority);
    }

    public getSurfaces(): IGridSurface[] {
        const surfaces: IGridSurface[] = [];
        this._surfaceHooks.apply(surfaces);
        return surfaces;
    }
}


