import { HookRegistry, IHookPoint } from "@core";

/** Something a module draws over the grid. */
export interface IGridSurface {
    key: string;
    /** What it draws, or `null` while the module has nothing to show. */
    onRender: () => JSX.Element | null;
}

/** A hook over what the modules draw over the grid. */
export type GridSurfacesHook = (surfaces: IGridSurface[]) => void;

export interface IGridSurfacesHooks {
    /** What the modules draw over the grid. */
    readonly surfaces: IHookPoint<GridSurfacesHook>;
}

/** What the modules draw over the grid, assembled from what they added. */
export interface IGridSurfaces {
    readonly hooks: IGridSurfacesHooks;
}

/** What the grid's own parts read of it. */
export interface IGridSurfacesInternal extends IGridSurfaces {
    /** Everything the modules draw over the grid, in order. */
    getSurfaces(): IGridSurface[];
}

export class GridSurfaces implements IGridSurfacesInternal {
    public readonly hooks = {
        surfaces: new HookRegistry<GridSurfacesHook>(),
    };

    public getSurfaces(): IGridSurface[] {
        const surfaces: IGridSurface[] = [];
        this.hooks.surfaces.apply(surfaces);
        return surfaces;
    }
}

