import type { IGanttModule } from "../../interfaces";
import { GanttSelectionBox } from "./GanttSelectionBox";

export interface IGanttSelectionBoxModule extends IGanttModule<'selectionBox'> { }

export const createGanttSelectionBoxModule = (): IGanttSelectionBoxModule => ({
    name: 'selectionBox',
    onLoad: gantt => new GanttSelectionBox(gantt),
    onDestroy: selectionBox => selectionBox.destroy(),
});
