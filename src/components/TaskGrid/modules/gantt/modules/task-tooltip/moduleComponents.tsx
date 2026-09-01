import { TaskTooltip, TaskTooltipCallout } from "../../gantt-timeline/components";
import { IGanttTaskTooltipComponents } from "./createGanttTaskTooltipModule";
import { GanttTaskTooltipLayer } from "./tooltip-layer";

/** The defaults for {@link IGanttTaskTooltipComponents}. */
export const GanttTaskTooltipComponents: IGanttTaskTooltipComponents = {
    onRenderTooltipLayer: () => <GanttTaskTooltipLayer />,
    onRenderCallout: (props) => <TaskTooltipCallout {...props} />,
    onRenderTooltip: (props) => <TaskTooltip {...props} />,
};
