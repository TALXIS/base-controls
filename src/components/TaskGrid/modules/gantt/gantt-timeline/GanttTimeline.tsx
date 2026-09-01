import { useEffect, useMemo, useRef } from 'react';
import 'gantt-trial/codebase/dhtmlxgantt.css';
import { useTheme } from '@fluentui/react';
import { getGanttStyles } from './styles';
import { DatePreviewCallout, TimelineTaskCreateLine, TimelineTaskCreateRowOverlay } from './components';
import { useTimelineTaskCreate } from './hooks/useTimelineTaskCreate';
import { useTooltip } from './hooks/useTooltip';
import { useMarkers } from './hooks/useMarkers';
import { useSelectionBox } from './hooks/useSelectionBox';
import { useGanttComponents, useGanttServices } from '../context';

/**
 * The timeline half of the split view.
 *
 * It owns the element and nothing else: handing the container over is what starts the chart, which the
 * manager built with the module long before this mounted. Everything below waits for the chart's parts to
 * be registered, so none of it has to know when that happened.
 */
export const GanttTimeline = () => {
    const services = useGanttServices();
    const components = useGanttComponents();
    const ref = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const styles = useMemo(() => getGanttStyles(theme), [theme]);
    const { tooltip } = useTooltip();
    const { hoverPreview, linePreview, rowOverlay } = useTimelineTaskCreate();
    useSelectionBox();
    useMarkers();

    useEffect(() => {
        if (!ref.current) {
            throw new Error('Gantt container ref is not assigned');
        }
        services.register('ganttContainer', () => ref.current!);
    }, []);

    return (
        <>
            <div className={styles.container}>
                <div ref={ref} className={styles.root} />
                {rowOverlay && <TimelineTaskCreateRowOverlay {...rowOverlay} />}
                {linePreview && <TimelineTaskCreateLine {...linePreview} />}
            </div>
            {hoverPreview && <DatePreviewCallout target={hoverPreview.target} date={hoverPreview.date} />}
            {!hoverPreview && !linePreview && tooltip && components.onRenderTaskTooltip({ task: tooltip.task, event: tooltip.event })}
        </>
    );
}
