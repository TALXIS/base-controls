import type { GanttEnterprise } from "dhtmlx-gantt";
import type { ILibraryModule } from "./createLibraryModule";
import { Library } from "./Library";

export interface IProLibraryModuleParameters {
    /** The PRO build's `Gantt` export. */
    Gantt: GanttEnterprise;
}

/** A PRO build of DHTMLX Gantt, whose stylesheet the consumer imports. */
export const createProLibraryModule = (parameters: IProLibraryModuleParameters): ILibraryModule => ({
    name: 'library',
    //the other modules read the library as they load
    priority: -100,
    onLoad: () => new Library({ Gantt: parameters.Gantt, isPro: true }),
});
