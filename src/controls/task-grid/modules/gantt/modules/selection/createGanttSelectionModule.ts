import type { IGanttModule } from "../../interfaces";
import { GanttSelection, IGanttSelectionParameters } from "./GanttSelection";

export interface IGanttSelectionModule extends IGanttModule<'selection'> { }

export const createGanttSelectionModule = (parameters: IGanttSelectionParameters = {}): IGanttSelectionModule => ({
    name: 'selection',
    onLoad: gantt => new GanttSelection(gantt, parameters),
    onDestroy: selection => selection.destroy(),
});
