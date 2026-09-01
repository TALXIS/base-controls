import { IGanttComponents } from "../interfaces";
import { GanttWeekendToggle } from "./weekend-toggle";
import { ZoomSliderAdapter } from "./zoom-slider-adapter";
import { GanttView } from "./gantt-view";
import { Marker, ProjectMarker } from "./gantt-timeline/components/marker";
import { MilestoneMarker } from "./gantt-timeline/components/marker/milestone-marker";
import { TaskTooltipAdapter } from "./gantt-timeline/components/task-tooltip-adapter";

/** The defaults for {@link IGanttComponents}. */
export const GanttComponents: IGanttComponents = {
    onRenderView: (props) => <GanttView {...props} />,
    onRenderZoomSlider: () => <ZoomSliderAdapter />,
    onRenderSettingsSection: () => <GanttWeekendToggle />,
    onRenderTaskTooltip: (props) => <TaskTooltipAdapter {...props} />,
    onRenderMarker: (props) => {
        switch (props.type) {
            case 'milestone': {
                return <MilestoneMarker {...props} />
            }
            case 'project_start':
            case 'project_end': {
                return <ProjectMarker {...props} />
            }
            default: {
                return <Marker {...props} />
            }
        }
    }
};
