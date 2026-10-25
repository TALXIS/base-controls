import type { IGanttMarker, IGanttMarkersParameters, IGanttMarkersStore } from "../GanttMarkers";
import { createGanttMarkersModule, IGanttMarkersModule } from "../createGanttMarkersModule";

export interface IMemoryGanttMarkersModuleParameters extends Omit<IGanttMarkersParameters, 'onCreateStore'> {
    markers: IGanttMarker[];
}

class MemoryGanttMarkersStore implements IGanttMarkersStore {
    private _markers: IGanttMarker[];

    constructor(markers: IGanttMarker[]) {
        this._markers = markers;
    }

    public async onLoadMarkers(): Promise<IGanttMarker[]> {
        return this._markers;
    }
}

/** Markers held in memory. */
export const createMemoryGanttMarkersModule = (parameters: IMemoryGanttMarkersModuleParameters): IGanttMarkersModule => {
    const { markers, ...moduleParameters } = parameters;
    return createGanttMarkersModule({ ...moduleParameters, onCreateStore: () => new MemoryGanttMarkersStore(markers) });
};
