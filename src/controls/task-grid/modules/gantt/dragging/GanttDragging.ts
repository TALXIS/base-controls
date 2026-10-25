import type { GanttStatic } from "gantt-trial";
import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { GANTT_DRAGGING_DISABLED_CLASS, GANTT_TASK_LINE_CLASS } from "../chart/classNames";

export interface IGanttDraggingEvents {
    onDragStarted: (taskId: string) => void;
    onDragEnded: () => void;
}

/** Who owns the pointer on the chart, and when a bar is being dragged. */
export interface IGanttDragging {
    readonly events: IEventEmitter<IGanttDraggingEvents>;
    /** Keeps bars still, for a gesture that wants the pointer for something else. */
    setDraggingDisabled(isDisabled: boolean): void;
    isDraggingDisabled(): boolean;
}

export class GanttDragging implements IGanttDragging {
    public readonly events = new EventEmitter<IGanttDraggingEvents>();
    private _gantt: GanttStatic;
    private _draggedTaskId?: string;

    constructor(gantt: GanttStatic) {
        this._gantt = gantt;
        gantt.config.drag_timeline = { ignore: `.${GANTT_DRAGGING_DISABLED_CLASS}, .${GANTT_TASK_LINE_CLASS}` };
        gantt.attachEvent('onBeforeTaskDrag', () => !this.isDraggingDisabled());
        gantt.attachEvent('onTaskDrag', this._onTaskDrag);
        gantt.attachEvent('onAfterTaskDrag', this._onAfterTaskDrag);
    }

    public setDraggingDisabled(isDisabled: boolean): void {
        this._gantt.$root?.classList.toggle(GANTT_DRAGGING_DISABLED_CLASS, isDisabled);
    }

    public isDraggingDisabled(): boolean {
        return this._gantt.$root?.classList.contains(GANTT_DRAGGING_DISABLED_CLASS) ?? false;
    }

    //on the first movement, as another handler may still refuse the drag
    private _onTaskDrag = (taskId: string | number): void => {
        if (this._draggedTaskId === String(taskId)) {
            return;
        }
        this._draggedTaskId = String(taskId);
        this.events.dispatchEvent('onDragStarted', this._draggedTaskId);
    };

    private _onAfterTaskDrag = (): void => {
        if (this._draggedTaskId) {
            this._draggedTaskId = undefined;
            this.events.dispatchEvent('onDragEnded');
        }
    };
}
