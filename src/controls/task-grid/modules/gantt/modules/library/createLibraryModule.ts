import { Gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import type { IGanttModule } from "../../interfaces";
import { GanttLibrary } from "./GanttLibrary";

export interface IGanttLibraryModule extends IGanttModule<'library'> { }

/** The free MIT build of DHTMLX Gantt. */
export const createGanttLibraryModule = (): IGanttLibraryModule => ({
    name: 'library',
    onLoad: () => new GanttLibrary({ Gantt, isPro: false }),
});
