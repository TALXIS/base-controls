import { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { getMarkerStyles } from './styles';
import {
    CUSTOM_MARKER_CLASS,
    IGanttMarkers,
    IGanttMarkersEvents,
    LABEL_OVERLAY_ATTR,
    MILESTONE_MARKER_CLASS,
    PROJECT_END_MARKER_CLASS,
    PROJECT_START_MARKER_CLASS,
    SCALE_LABEL_ATTR,
    TODAY_MARKER_CLASS,
} from '../../../gantt-markers';
import { MarkerType } from '../../../gantt-markers';
import { useEventEmitter } from '@hooks';
import { useGanttComponents, useGanttService } from '../../../context';


const getMarkerType = (css: string): MarkerType => {
    switch (css) {
        case MILESTONE_MARKER_CLASS:
            return 'milestone';
        case PROJECT_START_MARKER_CLASS:
            return 'project_start';
        case PROJECT_END_MARKER_CLASS:
            return 'project_end';
        case TODAY_MARKER_CLASS:
            return 'today';
        case CUSTOM_MARKER_CLASS:
        default:
            return 'custom';
    }
};

/**
 * Draws each marker's label as a React chip on the timeline's scale.
 *
 * The chips live in an overlay of our own inside `$task`, because the library replaces everything it owns
 * on a zoom re-render. Waits for the marker part, which the manager registers once the chart is live.
 */
export const useMarkers = () => {
    const components = useGanttComponents();
    const gantt = useGanttService('ganttChart');
    const markers = useGanttService('ganttMarkers');
    const styles = useMemo(() => getMarkerStyles(), []);

    useEventEmitter<IGanttMarkersEvents>(markers?.events, 'onMarkersUpdated', () => renderScaleLabels());

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

            const chip = document.createElement('div');
            ReactDOM.render(components.onRenderMarker({
                ...marker,
                type: getMarkerType(marker.css ?? ''),
                innerProps: {
                    className: styles.chip,
                    style: { left: `${left - 1}px` }
                },
            }), chip);
            chip.setAttribute(SCALE_LABEL_ATTR, String(marker.id));
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