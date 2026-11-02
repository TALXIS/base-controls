import { createElement } from "react";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import type { IGanttSpan } from "../../schedule";
import { runQuietly } from "../../../../runtime/runQuietly";
import { TaskDrawingLayer } from "./components/adapters/task-drawing-layer";
import type { ITaskDrawingUiPreviewComponents } from "./components/ui/preview";
import { getTaskDrawingStyles } from "./styles";

/** The replaceable pieces of drawing a task, by the part they belong to. */
export interface ITaskDrawingComponents {
    preview?: Partial<ITaskDrawingUiPreviewComponents>;
}

export interface ITaskDrawingParameters {
    components?: ITaskDrawingComponents;
}

/** The `taskDrawing` module: Ctrl+drag over the timeline draws a new task. */
export interface ITaskDrawing {
    /** Whether tasks can be created at all. */
    isEnabled(): boolean;
    /** Creates a task first under the row's parent, running over the span. */
    create(rowTaskId: string, span: IGanttSpan): Promise<void>;
    getComponents(): ITaskDrawingComponents;
    /** Called as the Gantt goes. */
    destroy(): void;
}

export class TaskDrawing implements ITaskDrawing {
    private _gantt: IGantt;
    private _parameters: ITaskDrawingParameters;
    private _unregisters: (() => void)[];

    constructor(gantt: IGantt, parameters: ITaskDrawingParameters) {
        this._gantt = gantt;
        this._parameters = parameters;
        this._unregisters = [
            gantt.surfaces.registerSurface(this._onSurfaces),
            gantt.services.get('theme').registerStyles(result => result.styles.push(getTaskDrawingStyles())),
        ];
    }

    public isEnabled(): boolean {
        return this._gantt.getTaskRuntime().isCreationEnabled();
    }

    public async create(rowTaskId: string, span: IGanttSpan): Promise<void> {
        const taskRuntime = this._gantt.getTaskRuntime();
        const parentId = taskRuntime.getProvider().getRecordTree().structure.getParent(rowTaskId)?.getRecordId();
        await runQuietly(() => taskRuntime.tasks.create(parentId, { data: this._gantt.services.get('schedule').getColumnValues(span) }));
    }

    public getComponents(): ITaskDrawingComponents {
        return this._parameters.components ?? {};
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
    }

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        surfaces.push({ key: 'taskDrawing', onRender: () => createElement(TaskDrawingLayer) });
    };
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** Drawing new tasks on the timeline. */
        taskDrawing: ITaskDrawing;
    }
}
