import { createElement } from "react";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import { ITaskTooltipRendererComponents, TaskTooltipRenderer } from "./adapters/renderer";

export interface ITaskTooltipParameters {
    /** The whole tooltip, composed from `TaskTooltip`'s parts. */
    onRender?: () => JSX.Element | null;
    /** The replaceable pieces of the default tooltip, unused with `onRender`. */
    components?: ITaskTooltipRendererComponents;
    /** An option set column the header shows as a pill in its option's colour. */
    statusColumnName?: string;
}

/** The `taskTooltip` module: what a bar says when the pointer is on it. */
export interface ITaskTooltip {
    getStatusColumnName(): string | undefined;
    getComponents(): ITaskTooltipRendererComponents;
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

    public getComponents(): ITaskTooltipRendererComponents {
        return this._parameters.components ?? {};
    }

    private _render(): JSX.Element | null {
        return this._parameters.onRender ? this._parameters.onRender() : createElement(TaskTooltipRenderer, { components: this.getComponents() });
    }

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        surfaces.push({ key: 'taskTooltip', onRender: () => this._render() });
    };
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** What a bar says when the pointer is on it. */
        taskTooltip: ITaskTooltip;
    }
}
