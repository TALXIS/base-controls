import type { IGanttModule } from "../../interfaces";
import { GanttMarkers, IGanttMarkersParameters } from "./GanttMarkers";

export interface IGanttMarkersModule extends IGanttModule<'markers'> { }

export const createGanttMarkersModule = (parameters: IGanttMarkersParameters = {}): IGanttMarkersModule => ({
    name: 'markers',
    onLoad: async gantt => {
        const markers = new GanttMarkers(gantt, parameters);
        await markers.load();
        return markers;
    },
    onDestroy: markers => markers.destroy(),
});
