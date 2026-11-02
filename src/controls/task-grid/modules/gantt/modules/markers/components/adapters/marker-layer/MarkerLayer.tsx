import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { useGanttModule, useGanttService } from "../../../../../context";
import type { IGanttMarkersEvents } from "../../../GanttMarkers";
import { GanttMarkerUiLayer } from "../../ui";
import { GanttMarker } from "../marker";

/** The markers over the timeline, inside the chart so they scroll with it. */
export const GanttMarkerLayer = () => {
    const markers = useGanttModule('markers');
    const chart = useGanttService('chart');
    const [mountPoint] = useState(createMountPoint);
    const { rerender } = useRerender();

    useEventEmitter<IGanttMarkersEvents>(markers.events, 'onMarkersChanged', rerender);

    //the chart rebuilds what it owns on every render, so the mount point is re-placed after each
    useEffect(() => {
        if (!chart) {
            return;
        }
        const place = () => {
            if (mountPoint.parentElement !== chart.$task) {
                chart.$task.appendChild(mountPoint);
            }
            rerender();
            return true;
        };
        const eventId = chart.attachEvent('onGanttRender', place);
        place();
        return () => {
            chart.detachEvent(eventId);
            mountPoint.remove();
        };
    }, [chart]);

    if (!chart) {
        return null;
    }
    return createPortal(<GanttMarkerUiLayer components={markers.getComponents().layer}>
        {markers.getMarkers().map(marker => <GanttMarker key={marker.id} marker={marker} chart={chart} />)}
    </GanttMarkerUiLayer>, mountPoint);
};

//lays nothing out, so the layer inside it is placed against the chart
const createMountPoint = (): HTMLDivElement => {
    const mountPoint = document.createElement('div');
    mountPoint.style.display = 'contents';
    return mountPoint;
};
