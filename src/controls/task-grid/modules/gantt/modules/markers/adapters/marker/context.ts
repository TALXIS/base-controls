import { createContext, useContext } from "react";
import type { IMarker } from "../../Markers";

/** The marker a part is drawn for. */
export interface IMarkerContext {
    marker: IMarker;
    /** Where the marker's date is on the timeline, in pixels. */
    left: number;
}

export const MarkerContext = createContext<IMarkerContext | undefined>(undefined);
MarkerContext.displayName = 'Marker';

/** The marker this is drawn for. */
export const useMarker = (): IMarkerContext => {
    const context = useContext(MarkerContext);
    if (!context) {
        throw new Error('This has to be drawn inside a Gantt marker.');
    }
    return context;
};
