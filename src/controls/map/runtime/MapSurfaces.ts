import { HookRegistry, IHookPoint } from "@core";

/** Something a module draws in the map's box. */
export interface IMapSurface {
    key: string;
    /** What it draws, or `null` while the module has nothing to show. */
    onRender: () => JSX.Element | null;
}

/** A hook over what the modules draw in the map's box. */
export type MapSurfacesHook = (surfaces: IMapSurface[]) => void;

export interface IMapSurfacesHooks {
    /** What the modules draw in the map's box. */
    readonly surfaces: IHookPoint<MapSurfacesHook>;
}

/** What the modules draw in the map's box, assembled from what they added. */
export interface IMapSurfaces {
    readonly hooks: IMapSurfacesHooks;
}

/** What the map's own parts read of it. */
export interface IMapSurfacesInternal extends IMapSurfaces {
    /** Everything the modules draw in the map's box, in order. */
    getSurfaces(): IMapSurface[];
}

export class MapSurfaces implements IMapSurfacesInternal {
    public readonly hooks = {
        surfaces: new HookRegistry<MapSurfacesHook>(),
    };

    public getSurfaces(): IMapSurface[] {
        const surfaces: IMapSurface[] = [];
        this.hooks.surfaces.apply(surfaces);
        return surfaces;
    }
}
