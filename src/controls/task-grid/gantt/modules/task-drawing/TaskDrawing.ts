import { createElement } from "react";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import type { IGanttSpan } from "../../schedule";
import { runQuietly } from "../../../runtime/runQuietly";
import { TaskDrawingLayer } from "./adapters/task-drawing-layer";
import type { ITaskDrawingUiPreviewComponents } from "./ui/preview";
import { getTaskDrawingStyles } from "./styles";

/** The replaceable pieces of drawing a task, by the part they belong to. */
export interface ITaskDrawingComponents {
    preview?: Partial<ITaskDrawingUiPreviewComponents>;
}

export interface ITaskDrawingParameters {
    components?: ITaskDrawingComponents;
}

/** The `taskDrawing` module: drawing new tasks, and the dates of tasks that have none. */
export interface ITaskDrawing {
    /** Whether tasks can be created at all. */
    isEnabled(): boolean;
    /** Creates a task under the row's parent at the default position, over the span. */
    create(rowTaskId: string, span: IGanttSpan): Promise<void>;
    /** Whether a drag on the task's row can draw its dates. */
    canDrawDates(taskId: string): boolean;
    /** Saves the span as the dates of a task that has none. */
    drawDates(taskId: string, span: IGanttSpan): void;
    getComponents(): ITaskDrawingComponents;
}

export class TaskDrawing implements ITaskDrawing {
    private _gantt: IGantt;
    private _parameters: ITaskDrawingParameters;

    constructor(gantt: IGantt, parameters: ITaskDrawingParameters) {
        this._gantt = gantt;
        this._parameters = parameters;
        gantt.surfaces.hooks.surfaces.add(this._onSurfaces);
        gantt.services.get('theme').hooks.styles.add(result => result.styles.push(getTaskDrawingStyles()));
    }

    public isEnabled(): boolean {
        return this._gantt.getTaskRuntime().isCreationEnabled();
    }

    public async create(rowTaskId: string, span: IGanttSpan): Promise<void> {
        const taskRuntime = this._gantt.getTaskRuntime();
        const parentId = taskRuntime.getProvider().getRecordTree().structure.getParent(rowTaskId)?.getRecordId();
        await runQuietly(() => taskRuntime.tasks.create(parentId, { data: this._gantt.services.get('schedule').getColumnValues(span) }));
    }

    public canDrawDates(taskId: string): boolean {
        const chart = this._gantt.services.find('chart');
        const tasks = this._gantt.services.find('tasks');
        const taskRuntime = this._gantt.getTaskRuntime();
        if (!chart?.isTaskExists(taskId) || !chart.getTask(taskId).unscheduled || !tasks || !taskRuntime.isEditingEnabled() || !this._gantt.services.get('grid').modules.find('editing')) {
            return false;
        }
        const hasSubtasks = taskRuntime.getProvider().getRecordTree().structure.getDescendants(taskId).length > 0;
        return !hasSubtasks && !tasks.isLocked(taskId) && !tasks.isInSavingChain(taskId);
    }

    public drawDates(taskId: string, span: IGanttSpan): void {
        const record = this._gantt.services.get('tasks').getRecord(taskId);
        if (record) {
            this._gantt.services.get('schedule').save(record, span);
        }
    }

    public getComponents(): ITaskDrawingComponents {
        return this._parameters.components ?? {};
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
