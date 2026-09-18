import { useGanttServices } from "../../context";
import { IGanttMarkersComponents } from "./createGanttMarkersModule";
import { IMarkerProps } from "./components";

/** What one timeline marker is rendered with — the marker itself, plus its positioning props. */
export type IGanttMarkerProps = IMarkerProps;

/** The markers module's components, as it resolved them. Only called where the module is registered. */
export const useGanttMarkersComponents = (): IGanttMarkersComponents => {
    return useGanttServices().get('markersModule').components;
};
