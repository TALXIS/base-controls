import { TaskTooltipAdapter } from "../components";
import { useTooltip } from "../hooks/useTooltip";

/**
 * Where the tooltip lives.
 *
 * A component rather than a hook call in the timeline, so the Gantt core renders this module without
 * knowing what is in it. Placement does not matter: what it renders is a callout, which portals out.
 */
export const GanttTaskTooltipLayer = () => {
    const { tooltip } = useTooltip();

    if (!tooltip) {
        return null;
    }

    return <TaskTooltipAdapter task={tooltip.task} event={tooltip.event} />;
};
