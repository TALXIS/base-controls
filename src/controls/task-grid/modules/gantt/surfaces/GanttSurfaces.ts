import { HookRegistry } from "@utils";

/** Something a module draws over the Gantt. */
export interface IGanttSurface {
    key: string;
    /** What it draws, or `null` while the module has nothing to show. */
    onRender: () => JSX.Element | null;
}

/** A hook over what the modules draw over the Gantt. */
export type GanttSurfacesHook = (surfaces: IGanttSurface[]) => void;

/** What the modules draw over the Gantt, assembled from what they registered. */
export interface IGanttSurfaces {
    /**
     * Registers a hook over what the modules draw over the Gantt, once its chart is drawn.
     *
     * @param priority Ascending: a lower number is drawn first.
     */
    registerSurface(hook: GanttSurfacesHook, priority?: number): () => void;
}

/** What the Gantt's own parts read of it. */
export interface IGanttSurfacesInternal extends IGanttSurfaces {
    /** Everything the modules draw over the Gantt, in order. */
    getSurfaces(): IGanttSurface[];
}

export class GanttSurfaces implements IGanttSurfacesInternal {
    private _surfaceHooks = new HookRegistry<GanttSurfacesHook>();

    public registerSurface(hook: GanttSurfacesHook, priority?: number): () => void {
        return this._surfaceHooks.register(hook, priority);
    }

    public getSurfaces(): IGanttSurface[] {
        const surfaces: IGanttSurface[] = [];
        this._surfaceHooks.apply(surfaces);
        return surfaces;
    }
}
