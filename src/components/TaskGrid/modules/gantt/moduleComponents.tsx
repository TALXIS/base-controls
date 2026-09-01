import { IGanttComponents } from "../interfaces";
import { GanttWeekendToggle } from "./weekend-toggle";
import { ZoomSliderAdapter } from "./zoom-slider-adapter";
import { GanttView } from "./gantt-view";

/** The defaults for {@link IGanttComponents}. */
export const GanttComponents: IGanttComponents = {
    onRenderView: (props) => <GanttView {...props} />,
    onRenderZoomSlider: () => <ZoomSliderAdapter />,
    onRenderSettingsSection: () => <GanttWeekendToggle />,
};
