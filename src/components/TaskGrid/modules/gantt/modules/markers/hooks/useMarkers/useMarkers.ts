import { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { getMarkerLayerStyles } from './styles';
import { LABEL_OVERLAY_ATTR, SCALE_LABEL_ATTR } from '../../classNames';
import { IGanttMarkersProviderEvents } from '../../GanttMarkersProvider';
import { useEventEmitter } from '@hooks';
import { useGanttService } from '../../../../context';
import { useGanttMarkersComponents } from '../../context';


/**
 * Draws each marker's label as a React chip on the timeline's scale.
 *
 * The chips live in an overlay of our own inside `$task`, because the library replaces everything it owns
 * on a zoom re-render. Waits for the marker part, which the manager registers once the chart is live.
 */
export const useMarkers = () => {
    const components = useGanttMarkersComponents();
    const gantt = useGanttService('ganttChart');
    const markers = useGanttService('ganttMarkers');
    const styles = useMemo(() => getMarkerLayerStyles(), []);

    useEventEmitter<IGanttMarkersProviderEvents>(markers?.events, 'onMarkersUpdated', () => renderScaleLabels());

    const renderScaleLabels = () => {
        const taskEl = gantt?.$task;
        if (!gantt || !markers || !taskEl) {
            return;
        }

        let overlay = taskEl.querySelector<HTMLElement>(`[${LABEL_OVERLAY_ATTR}]`);
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.setAttribute(LABEL_OVERLAY_ATTR, '');
            overlay.className = styles.overlay;
            taskEl.appendChild(overlay);
        }

        overlay.querySelectorAll<HTMLElement>(`[${SCALE_LABEL_ATTR}]`).forEach((el) => el.remove());

        const scaleHeight = gantt.config.scale_height ?? 44;
        overlay.style.height = `${scaleHeight}px`;

        for (const marker of markers.getMarkers()) {
            const left = gantt.posFromDate(marker.start_date);
            if (!left && left !== 0) continue;

            //the slot is the layer's to place; what a marker draws inside it is the marker's
            const chip = document.createElement('div');
            chip.className = styles.chip;
            chip.style.left = `${left - 1}px`;
            chip.setAttribute(SCALE_LABEL_ATTR, String(marker.id));
            ReactDOM.render(components.onRenderMarker({ ...marker }), chip);
            overlay.appendChild(chip);
        }
    };

    useEffect(() => {
        if (!gantt) {
            return;
        }
        const eventId = gantt.attachEvent('onGanttRender', renderScaleLabels);
        renderScaleLabels();

        return () => {
            gantt.$task?.querySelector<HTMLElement>(`[${LABEL_OVERLAY_ATTR}]`)?.remove();
            gantt.detachEvent(eventId);
        };
    }, [gantt, markers]);
};