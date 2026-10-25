import type { IGanttModule } from "../../interfaces";
import { GanttWeekends, IGanttWeekendsParameters } from "./GanttWeekends";

export interface IGanttWeekendsModule extends IGanttModule<'weekends'> { }

export const createGanttWeekendsModule = (parameters: IGanttWeekendsParameters = {}): IGanttWeekendsModule => ({
    name: 'weekends',
    onLoad: gantt => new GanttWeekends(gantt, parameters),
    onDestroy: weekends => weekends.destroy(),
});
