import { HookRegistry } from "@core";

/** Something a module draws in the DatasetControl. */
export interface IDatasetControlSurface {
    key: string;
    /** What it draws, or `null` while the module has nothing to show. */
    onRender: () => JSX.Element | null;
}

/** A hook over what the modules draw in the DatasetControl. */
export type DatasetControlSurfacesHook = (surfaces: IDatasetControlSurface[]) => void;

/** What the modules draw in the DatasetControl, assembled from what they added. */
export interface IDatasetControlSurfaces {
    /**
     * Adds a hook over what the modules draw in the DatasetControl.
     *
     * @param priority Ascending: a higher number runs later.
     */
    addSurfacesHook(hook: DatasetControlSurfacesHook, priority?: number): () => void;
}

/** What the control's own parts read of it. */
export interface IDatasetControlSurfacesInternal extends IDatasetControlSurfaces {
    /** Everything the modules draw in the control, in order. */
    getSurfaces(): IDatasetControlSurface[];
}

export class DatasetControlSurfaces implements IDatasetControlSurfacesInternal {
    private _surfaceHooks = new HookRegistry<DatasetControlSurfacesHook>();

    public addSurfacesHook(hook: DatasetControlSurfacesHook, priority?: number): () => void {
        return this._surfaceHooks.add(hook, priority);
    }

    public getSurfaces(): IDatasetControlSurface[] {
        const surfaces: IDatasetControlSurface[] = [];
        this._surfaceHooks.apply(surfaces);
        return surfaces;
    }
}
