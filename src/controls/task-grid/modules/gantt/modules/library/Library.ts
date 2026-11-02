import type { GanttEnterprise } from "dhtmlx-gantt";

/** The `library` module: the DHTMLX Gantt build every chart is created from. */
export interface ILibrary {
    readonly Gantt: GanttEnterprise;
    /** Whether the build has the PRO features. */
    readonly isPro: boolean;
}

export interface ILibraryParameters {
    Gantt: GanttEnterprise;
    isPro: boolean;
}

export class Library implements ILibrary {
    public readonly Gantt: GanttEnterprise;
    public readonly isPro: boolean;

    constructor(parameters: ILibraryParameters) {
        this.Gantt = parameters.Gantt;
        this.isPro = parameters.isPro;
    }
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        library: ILibrary;
    }
}
