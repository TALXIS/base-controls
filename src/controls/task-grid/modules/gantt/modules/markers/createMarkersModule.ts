import type { IGanttModule } from "../../interfaces";
import { GanttMarkers, IGanttMarkersParameters } from "./GanttMarkers";

export interface IGanttMarkersModule extends IGanttModule<'markers'> { }

export const createGanttMarkersModule = (parameters: IGanttMarkersParameters = {}): IGanttMarkersModule => ({
    name: 'markers',
    onLoad: gantt => new GanttMarkers(gantt, parameters),
    onDestroy: markers => markers.destroy(),
});
