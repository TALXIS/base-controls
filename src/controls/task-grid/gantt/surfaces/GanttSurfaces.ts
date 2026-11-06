import { HookRegistry, IHookPoint } from "@core";

/** Something a module draws over the Gantt. */
export interface IGanttSurface {
    key: string;
    /** What it draws, or `null` while the module has nothing to show. */
    onRender: () => JSX.Element | null;
}

/** A hook over what the modules draw over the Gantt. */
export type GanttSurfacesHook = (surfaces: IGanttSurface[]) => void;

export interface IGanttSurfacesHooks {
    /** What the modules draw over the Gantt, once its chart is drawn. */
    readonly surfaces: IHookPoint<GanttSurfacesHook>;
}

/** What the modules draw over the Gantt, assembled from what they added. */
export interface IGanttSurfaces {
    readonly hooks: IGanttSurfacesHooks;
}

/** What the Gantt's own parts read of it. */
export interface IGanttSurfacesInternal extends IGanttSurfaces {
    /** Everything the modules draw over the Gantt, in order. */
    getSurfaces(): IGanttSurface[];
}

export class GanttSurfaces implements IGanttSurfacesInternal {
    public readonly hooks = {
        surfaces: new HookRegistry<GanttSurfacesHook>(),
    };

    public getSurfaces(): IGanttSurface[] {
        const surfaces: IGanttSurface[] = [];
        this.hooks.surfaces.apply(surfaces);
        return surfaces;
    }
}
