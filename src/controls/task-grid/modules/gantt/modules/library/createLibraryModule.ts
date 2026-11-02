import { Gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import type { IGanttModule } from "../../interfaces";
import { Library } from "./Library";

export interface ILibraryModule extends IGanttModule<'library'> { }

/** The free MIT build of DHTMLX Gantt. */
export const createLibraryModule = (): ILibraryModule => ({
    name: 'library',
    onLoad: () => new Library({ Gantt, isPro: false }),
});
