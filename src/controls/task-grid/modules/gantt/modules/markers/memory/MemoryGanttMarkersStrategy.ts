import type { IGanttServiceLocator } from "../../../services";
import { ICustomMarker, IGanttMarkersStrategy } from "../GanttMarkersProvider";

export interface IMemoryGanttMarkersStrategyParams {
    /**
     * Where the rest of the Gantt is reached. Every strategy takes it, whether or not this one has a use
     * for it yet — one shape to remember, and nothing to change when it does.
     */
    services: IGanttServiceLocator;
    /** The markers to hand back. Deep-cloned on the way in, so a fixture can be shared between grids. */
    markers: ICustomMarker[];
}

/**
 * In-memory {@link IGanttMarkersStrategy} — the markers come from the array it was given, with no Dataverse
 * and no network. Intended for local development, tests, Storybook and demos.
 */
export class MemoryGanttMarkersStrategy implements IGanttMarkersStrategy {
    private _markers: ICustomMarker[];

    constructor(params: IMemoryGanttMarkersStrategyParams) {
        this._markers = structuredClone(params.markers);
    }

    public async onGetMarkers(): Promise<ICustomMarker[]> {
        return this._markers;
    }
}
