import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRerender } from "@legacy";
import { useGantt, useGanttModule, useGanttService } from "../../../../../context";
import { MarkerChip } from "../../ui/marker-chip";
import { getMarkerLayerStyles } from "./styles";

/** The markers' chips on the scale, inside the chart so they scroll with it. */
export const MarkerLayer = () => {
    const gantt = useGantt();
    const markers = useGanttModule('markers');
    const chart = useGanttService('chart');
    const styles = useMemo(() => getMarkerLayerStyles(), []);
    const [overlay] = useState(() => document.createElement('div'));
    const { rerender } = useRerender();

    //the chart rebuilds what it owns on every render, so the overlay is re-placed after each
    useEffect(() => {
        if (!chart) {
            return;
        }
        overlay.className = styles.overlay;
        const place = () => {
            overlay.style.height = `${chart.config.scale_height}px`;
            if (overlay.parentElement !== chart.$task) {
                chart.$task.appendChild(overlay);
            }
            rerender();
            return true;
        };
        const eventId = chart.attachEvent('onGanttRender', place);
        place();
        return () => {
            chart.detachEvent(eventId);
            overlay.remove();
        };
    }, [chart]);

    if (!chart) {
        return null;
    }
    const provider = gantt.getTaskRuntime().getProvider();
    return createPortal(markers.getMarkers().map(marker => {
        const left = chart.posFromDate(marker.date.toDate());
        return <div key={marker.id} className={styles.slot} style={{ left: left - 1 }}>
            <MarkerChip text={marker.text} title={provider.getFormatting().formatDateShort(marker.date.toDate())} color={marker.color} isMilestone={marker.isMilestone} />
        </div>;
    }), overlay);
};
