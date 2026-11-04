import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useEventEmitter, useRerender } from "@core";
import { useGanttModule, useGanttService } from "../../../../context";
import { MARKERS_MOUNT_POINT_CLASS } from "../../classNames";
import type { IMarkersEvents } from "../../Markers";
import { MarkerUiLayer } from "../../ui";
import { Marker } from "../marker";

/** The markers over the timeline, inside the chart so they scroll with it. */
export const MarkerLayer = () => {
    const markers = useGanttModule('markers');
    const chart = useGanttService('chart');
    const [mountPoint] = useState(createMountPoint);
    const { rerender } = useRerender();

    useEventEmitter<IMarkersEvents>(markers.events, 'onMarkersChanged', rerender);

    //the chart rebuilds what it owns on every render
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
        chart.attachEvent('onGanttRender', place);
        place();
    }, [chart]);

    if (!chart) {
        return null;
    }
    return createPortal(<MarkerUiLayer components={markers.getComponents().layer}>
        {markers.getMarkers().map(marker => <Marker key={marker.id} marker={marker} chart={chart} />)}
    </MarkerUiLayer>, mountPoint);
};

const createMountPoint = (): HTMLDivElement => {
    const mountPoint = document.createElement('div');
    mountPoint.className = MARKERS_MOUNT_POINT_CLASS;
    return mountPoint;
};
