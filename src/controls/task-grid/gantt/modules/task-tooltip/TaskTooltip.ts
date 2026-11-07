import { createElement } from "react";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import type { ITaskTooltipRendererComponents } from "./adapters/renderer";
import { TaskTooltipSurface } from "./adapters/task-tooltip-surface";

/** The tooltip's replaceable pieces: the whole of it, or the default's parts. */
export interface ITaskTooltipComponents extends ITaskTooltipRendererComponents {
    /** The whole tooltip, composed from `TaskTooltip`'s parts; the default's parts go unused with it. */
    onRender?: () => JSX.Element | null;
}

export interface ITaskTooltipParameters {
    components?: ITaskTooltipComponents;
    /** An option set column the header shows as a pill in its option's colour. */
    statusColumnName?: string;
}

/** The `taskTooltip` module: what a bar says when the pointer is on it. */
export interface ITaskTooltip {
    getStatusColumnName(): string | undefined;
    getComponents(): ITaskTooltipComponents;
}

export class TaskTooltip implements ITaskTooltip {
    private _parameters: ITaskTooltipParameters;

    constructor(gantt: IGantt, parameters: ITaskTooltipParameters) {
        this._parameters = parameters;
        gantt.surfaces.hooks.surfaces.add(this._onSurfaces);
    }

    public getStatusColumnName(): string | undefined {
        return this._parameters.statusColumnName;
    }

    public getComponents(): ITaskTooltipComponents {
        return this._parameters.components ?? {};
    }

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        surfaces.push({ key: 'taskTooltip', onRender: () => createElement(TaskTooltipSurface) });
    };
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** What a bar says when the pointer is on it. */
        taskTooltip: ITaskTooltip;
    }
}
