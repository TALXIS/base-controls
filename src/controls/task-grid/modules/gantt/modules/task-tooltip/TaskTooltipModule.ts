import { createElement } from "react";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import { ITaskTooltipRendererComponents, TaskTooltipRenderer } from "./components/adapters/renderer";

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
    /** Called as the Gantt goes. */
    destroy(): void;
}

export class TaskTooltipModule implements ITaskTooltip {
    private _parameters: ITaskTooltipParameters;
    private _unregisterSurface: () => void;

    constructor(gantt: IGantt, parameters: ITaskTooltipParameters) {
        this._parameters = parameters;
        this._unregisterSurface = gantt.surfaces.registerSurface(this._onSurfaces);
    }

    public getStatusColumnName(): string | undefined {
        return this._parameters.statusColumnName;
    }

    public getComponents(): ITaskTooltipRendererComponents {
        return this._parameters.components ?? {};
    }

    public destroy(): void {
        this._unregisterSurface();
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
