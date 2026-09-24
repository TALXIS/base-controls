import { HookRegistry } from "@utils";
import { IGridServiceLocator } from "../../services";

/** Something a module draws over the grid rather than in it. */
export interface IGridSurface {
    key: string;
    /** What it draws, which is nothing until the module has something to show. */
    onRender: () => JSX.Element | null;
}

/** A hook over what the modules draw over the grid. */
export type GridSurfacesHook = (surfaces: IGridSurface[]) => void;

export interface IGridSurfacesParameters {
    services: IGridServiceLocator;
}

/** What the modules draw over the grid, assembled from what they registered. */
export interface IGridSurfaces {
    /**
     * Registers a hook over what the modules draw over the grid.
     *
     * @param priority Ascending: a lower number is drawn first.
     */
    registerSurfaceHook(hook: GridSurfacesHook, priority?: number): () => void;
    /** Everything the modules draw over the grid, in order. */
    getSurfaces(): IGridSurface[];
}

export class GridSurfaces implements IGridSurfaces {
    private _services: IGridServiceLocator;
    private _surfaceHooks = new HookRegistry<GridSurfacesHook>();

    constructor(parameters: IGridSurfacesParameters) {
        this._services = parameters.services;
    }

    public registerSurfaceHook(hook: GridSurfacesHook, priority?: number): () => void {
        return this._surfaceHooks.register(hook, priority);
    }

    public getSurfaces(): IGridSurface[] {
        const surfaces: IGridSurface[] = [];
        this._surfaceHooks.apply(surfaces);
        return surfaces;
    }
}


