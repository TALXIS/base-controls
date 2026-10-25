import type { IGanttModule } from "../../interfaces";
import { GanttTooltip, IGanttTooltipParameters } from "./GanttTooltip";

export interface IGanttTooltipModule extends IGanttModule<'tooltip'> { }

export const createGanttTooltipModule = (parameters: IGanttTooltipParameters = {}): IGanttTooltipModule => ({
    name: 'tooltip',
    onLoad: gantt => new GanttTooltip(gantt, parameters),
    onDestroy: tooltip => tooltip.destroy(),
});
