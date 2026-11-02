import type { IGanttModule } from "../../interfaces";
import { TaskTooltipModule, ITaskTooltipParameters } from "./TaskTooltipModule";

export interface ITaskTooltipModule extends IGanttModule<'taskTooltip'> { }

export const createTaskTooltipModule = (parameters: ITaskTooltipParameters = {}): ITaskTooltipModule => ({
    name: 'taskTooltip',
    onLoad: gantt => new TaskTooltipModule(gantt, parameters),
    onDestroy: tooltip => tooltip.destroy(),
});
