import dayjs from "dayjs";
import type { MemoryTable } from "@core/state";
import type { IMarker, IMarkersParameters, IMarkersStore } from "../Markers";
import { createMarkersModule, IMarkersModule } from "../createMarkersModule";

/** A marker as a row of the `markers` table, its date as an ISO string. */
export interface IMemoryMarker extends Omit<IMarker, 'date'> {
    date: string;
}

export interface IMemoryMarkersModuleParameters extends Omit<IMarkersParameters, 'createStore'> {
    markers: MemoryTable<IMemoryMarker>;
}

class MemoryMarkersStore implements IMarkersStore {
    private _markers: MemoryTable<IMemoryMarker>;

    constructor(markers: MemoryTable<IMemoryMarker>) {
        this._markers = markers;
    }

    public async loadMarkers(): Promise<IMarker[]> {
        return this._markers.getRows().map(marker => ({ ...marker, date: dayjs(marker.date) }));
    }
}

/** Markers kept in the `markers` table you pass. */
export const createMemoryMarkersModule = (parameters: IMemoryMarkersModuleParameters): IMarkersModule => {
    const { markers, ...moduleParameters } = parameters;
    return createMarkersModule({ ...moduleParameters, createStore: () => new MemoryMarkersStore(markers) });
};
