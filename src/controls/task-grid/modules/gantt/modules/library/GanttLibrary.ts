import type { GanttEnterprise } from "dhtmlx-gantt";

/** The `library` module: the DHTMLX Gantt build every chart is created from. */
export interface IGanttLibrary {
    readonly Gantt: GanttEnterprise;
    /** Whether the build has the PRO features. */
    readonly isPro: boolean;
}

export class GanttLibrary implements IGanttLibrary {
    public readonly Gantt: GanttEnterprise;
    public readonly isPro: boolean;

    constructor(parameters: IGanttLibrary) {
        this.Gantt = parameters.Gantt;
        this.isPro = parameters.isPro;
    }
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        library: IGanttLibrary;
    }
}
