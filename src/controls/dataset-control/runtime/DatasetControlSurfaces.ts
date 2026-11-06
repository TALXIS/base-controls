import { HookRegistry, IHookPoint } from "@core";

/** Something a module draws in the DatasetControl. */
export interface IDatasetControlSurface {
    key: string;
    /** What it draws, or `null` while the module has nothing to show. */
    onRender: () => JSX.Element | null;
}

/** A hook over what the modules draw in the DatasetControl. */
export type DatasetControlSurfacesHook = (surfaces: IDatasetControlSurface[]) => void;

export interface IDatasetControlSurfacesHooks {
    /** What the modules draw in the DatasetControl. */
    readonly surfaces: IHookPoint<DatasetControlSurfacesHook>;
}

/** What the modules draw in the DatasetControl, assembled from what they added. */
export interface IDatasetControlSurfaces {
    readonly hooks: IDatasetControlSurfacesHooks;
}

/** What the control's own parts read of it. */
export interface IDatasetControlSurfacesInternal extends IDatasetControlSurfaces {
    /** Everything the modules draw in the control, in order. */
    getSurfaces(): IDatasetControlSurface[];
}

export class DatasetControlSurfaces implements IDatasetControlSurfacesInternal {
    public readonly hooks = {
        surfaces: new HookRegistry<DatasetControlSurfacesHook>(),
    };

    public getSurfaces(): IDatasetControlSurface[] {
        const surfaces: IDatasetControlSurface[] = [];
        this.hooks.surfaces.apply(surfaces);
        return surfaces;
    }
}
