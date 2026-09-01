import { IGanttMarkersComponents } from "./createGanttMarkersModule";
import { Marker } from "./components";
import { GanttMarkerLayer } from "./marker-layer";

/** The defaults for {@link IGanttMarkersComponents}. */
export const GanttMarkersComponents: IGanttMarkersComponents = {
    onRenderMarkerLayer: () => <GanttMarkerLayer />,
    //the chip, for every marker. Override this to draw one of them differently - MilestoneMarker is the
    //diamond, and a component of your own is as good
    onRenderMarker: (props) => <Marker {...props} />,
};
