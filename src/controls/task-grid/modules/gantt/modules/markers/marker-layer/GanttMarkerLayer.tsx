import { useMarkers } from "../hooks/useMarkers";

/**
 * The markers' place on the timeline.
 *
 * It renders nothing of its own: the chips live in an overlay inside the chart's task area, which the hook
 * builds and keeps in step. A component rather than a hook call in the timeline, so the Gantt core renders
 * this module without knowing what is in it.
 */
export const GanttMarkerLayer = () => {
    useMarkers();
    return null;
};
