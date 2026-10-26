import type { GanttEnterprise } from "dhtmlx-gantt";
import type { IGanttLibraryModule } from "./createGanttLibraryModule";
import { GanttLibrary } from "./GanttLibrary";

/** A PRO build of DHTMLX Gantt, whose stylesheet the consumer imports. */
export const createGanttProLibraryModule = (Gantt: GanttEnterprise): IGanttLibraryModule => ({
    name: 'library',
    onLoad: () => new GanttLibrary({ Gantt, isPro: true }),
});
