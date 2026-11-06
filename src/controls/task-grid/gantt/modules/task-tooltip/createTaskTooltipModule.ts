import type { IGanttModule } from "../../interfaces";
import { TaskTooltip, ITaskTooltipParameters } from "./TaskTooltip";

export interface ITaskTooltipModule extends IGanttModule<'taskTooltip'> { }

export const createTaskTooltipModule = (parameters: ITaskTooltipParameters = {}): ITaskTooltipModule => ({
    name: 'taskTooltip',
    onLoad: gantt => new TaskTooltip(gantt, parameters),
});
