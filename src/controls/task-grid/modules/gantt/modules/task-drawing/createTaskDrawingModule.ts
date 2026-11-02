import type { IGanttModule } from "../../interfaces";
import { GanttTaskCreate } from "./GanttTaskCreate";

export interface IGanttTaskCreateModule extends IGanttModule<'taskCreate'> { }

export const createGanttTaskCreateModule = (): IGanttTaskCreateModule => ({
    name: 'taskCreate',
    onLoad: gantt => new GanttTaskCreate(gantt),
    onDestroy: taskCreate => taskCreate.destroy(),
});
