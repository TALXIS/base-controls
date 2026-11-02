import type { IGanttModule } from "../../interfaces";
import { Markers, IMarkersParameters } from "./Markers";

export interface IMarkersModule extends IGanttModule<'markers'> { }

export const createMarkersModule = (parameters: IMarkersParameters = {}): IMarkersModule => ({
    name: 'markers',
    onLoad: gantt => new Markers(gantt, parameters),
    onDestroy: markers => markers.destroy(),
});
