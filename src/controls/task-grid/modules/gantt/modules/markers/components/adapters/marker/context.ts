import { createContext, useContext } from "react";
import type { IGanttMarker } from "../../../GanttMarkers";

/** The marker a part is drawn for. */
export interface IGanttMarkerContext {
    marker: IGanttMarker;
    /** Where the marker's date is on the timeline, in pixels. */
    left: number;
}

export const GanttMarkerContext = createContext<IGanttMarkerContext | undefined>(undefined);
GanttMarkerContext.displayName = 'GanttMarker';

/** The marker this is drawn for. */
export const useGanttMarker = (): IGanttMarkerContext => {
    const context = useContext(GanttMarkerContext);
    if (!context) {
        throw new Error('This has to be drawn inside a Gantt marker.');
    }
    return context;
};
