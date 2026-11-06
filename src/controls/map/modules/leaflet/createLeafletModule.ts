import type { IMapModule } from "../../interfaces";
import { ILeafletParameters, LeafletRuntime } from "./LeafletRuntime";

export interface ILeafletModule extends IMapModule<'library'> { }

/** Draws the map with Leaflet, over OpenStreetMap tiles unless told otherwise; import Leaflet's CSS in your app. */
export const createLeafletModule = (parameters: ILeafletParameters = {}): ILeafletModule => ({
    name: 'library',
    //the map's other modules may read the library as they load
    priority: -100,
    onLoad: map => new LeafletRuntime({ map, parameters }),
    onDestroy: leaflet => (leaflet as LeafletRuntime).destroy(),
});
