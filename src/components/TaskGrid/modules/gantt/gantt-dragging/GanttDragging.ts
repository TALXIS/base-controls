import { EventEmitter, IEventEmitter } from '@talxis/client-libraries';
import { GanttStatic } from 'gantt-trial';
import { IGanttServiceLocator } from '../services';
import {
    GANTT_DRAGGING_DISABLED_CLASS,
    GANTT_TASK_LINE_CLASS,
} from '../classNames';

export interface IGanttDragging {
    events: IEventEmitter<IGanttDraggingEvents>;
    /** Suppresses dragging a bar, for a gesture that wants the pointer for something else. */
    setDraggingDisabled: (disabled: boolean) => void;
    /** Whether some other gesture has the pointer — drawing a task, or a box selection. */
    isDraggingDisabled: () => boolean;
}

export interface IGanttDraggingEvents {
    onDragStarted: (taskId: string) => void;
    onDragEnded: () => void;
}

export interface IGanttDraggingParameters {
    /** Where the chart and the other parts are reached. */
    services: IGanttServiceLocator;
}

/**
 * The chart's drag gesture: who owns the pointer, and when a bar is being dragged.
 *
 * What a drag does to the task is the task-dragging module's, so with that module left out these events
 * simply never fire — the chart is configured to refuse the gesture in the first place.
 */
export class GanttDragging implements IGanttDragging {
    public readonly events: IEventEmitter<IGanttDraggingEvents> = new EventEmitter<IGanttDraggingEvents>();
    private _services: IGanttServiceLocator;
    private _draggedTaskId?: string;

    constructor(parameters: IGanttDraggingParameters) {
        this._services = parameters.services;
        this._gantt.config.drag_timeline = { ignore: `.${GANTT_DRAGGING_DISABLED_CLASS}, .${GANTT_TASK_LINE_CLASS}` };
        this._registerEventListeners();
    }

    private get _gantt(): GanttStatic {
        return this._services.get('ganttChart');
    }

    public setDraggingDisabled(disabled: boolean) {
        this._gantt.$root.classList.toggle(GANTT_DRAGGING_DISABLED_CLASS, disabled);
    }

    public isDraggingDisabled(): boolean {
        return this._gantt.$root.classList.contains(GANTT_DRAGGING_DISABLED_CLASS);
    }

    private _registerEventListeners() {
        this._gantt.attachEvent('onBeforeTaskDrag', (id: string) => this._onBeforeTaskDrag(id));
        this._gantt.attachEvent('onTaskDrag', (id: string) => this._onTaskDrag(id));
        this._gantt.attachEvent('onAfterTaskDrag', () => this._onAfterTaskDrag());
    }

    private _onBeforeTaskDrag(taskId: string) {
        if (this.isDraggingDisabled()) {
            return false;
        }
        const task = this._gantt.getTask(taskId);
        return !!task?.active;
    }

    //announced on the first movement rather than when the gesture is allowed: another handler can still
    //refuse the drag, and nothing should be told a bar is moving that never moves
    private _onTaskDrag(taskId: string) {
        if (this._draggedTaskId === taskId) {
            return;
        }
        this._draggedTaskId = taskId;
        this.events.dispatchEvent('onDragStarted', taskId);
    }

    private _onAfterTaskDrag() {
        if (!this._draggedTaskId) {
            return;
        }
        this._draggedTaskId = undefined;
        this.events.dispatchEvent('onDragEnded');
    }
}
