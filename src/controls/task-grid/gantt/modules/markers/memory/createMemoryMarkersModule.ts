import { simulateBackend } from "../../../../runtime/data-sources/memory/simulateBackend";
import type { IMarker, IMarkersParameters, IMarkersStore } from "../Markers";
import { createMarkersModule, IMarkersModule } from "../createMarkersModule";

export interface IMemoryMarkersModuleParameters extends Omit<IMarkersParameters, 'createStore'> {
    markers: IMarker[];
}

class MemoryMarkersStore implements IMarkersStore {
    private _markers: IMarker[];

    constructor(markers: IMarker[]) {
        this._markers = markers;
    }

    public async loadMarkers(): Promise<IMarker[]> {
        await simulateBackend();
        return this._markers;
    }
}

/** Markers held in memory. */
export const createMemoryMarkersModule = (parameters: IMemoryMarkersModuleParameters): IMarkersModule => {
    const { markers, ...moduleParameters } = parameters;
    return createMarkersModule({ ...moduleParameters, createStore: () => new MemoryMarkersStore(markers) });
};
