import { IGanttComponents } from "../interfaces";
import { GanttWeekendToggle } from "./weekend-toggle";
import { ZoomSliderAdapter } from "./zoom-slider-adapter";
import { GanttView } from "./gantt-view";
import { TaskTooltipAdapter } from "./gantt-timeline/components/task-tooltip-adapter";

/** The defaults for {@link IGanttComponents}. */
export const GanttComponents: IGanttComponents = {
    onRenderView: (props) => <GanttView {...props} />,
    onRenderZoomSlider: () => <ZoomSliderAdapter />,
    onRenderSettingsSection: () => <GanttWeekendToggle />,
    onRenderTaskTooltip: (props) => <TaskTooltipAdapter {...props} />,
};
