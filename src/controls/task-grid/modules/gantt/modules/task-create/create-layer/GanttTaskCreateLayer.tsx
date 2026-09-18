import { DatePreviewCallout, TimelineTaskCreateLine, TimelineTaskCreateRowOverlay } from "../components";
import { useTimelineTaskCreate } from "../hooks/useTimelineTaskCreate";

/**
 * What the gesture draws while a task is being created: the row it is on, the span, and the date under the
 * pointer.
 *
 * A component rather than a hook call in the timeline, so the Gantt core renders this module without
 * knowing what is in it. The line and the overlay are positioned against the timeline's container, which
 * is where the core renders this.
 */
export const GanttTaskCreateLayer = () => {
    const { hoverPreview, linePreview, rowOverlay } = useTimelineTaskCreate();

    return (
        <>
            {rowOverlay && <TimelineTaskCreateRowOverlay {...rowOverlay} />}
            {linePreview && <TimelineTaskCreateLine {...linePreview} />}
            {hoverPreview && <DatePreviewCallout target={hoverPreview.target} date={hoverPreview.date} />}
        </>
    );
};
