import type { GanttStatic } from "dhtmlx-gantt";
import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { GANTT_DRAGGING_DISABLED_CLASS, GANTT_TASK_LINE_CLASS } from "../chart";

export interface IGanttDraggingEvents {
    onDragStarted: (taskId: string) => void;
    onDragEnded: () => void;
    /** Another gesture took the pointer, or gave it back. */
    onDraggingDisabledChanged: (isDisabled: boolean) => void;
}

/** Who owns the pointer on the chart, and when a bar is being dragged. */
export interface IGanttDragging {
    readonly events: IEventEmitter<IGanttDraggingEvents>;
    /**
     * Keeps bars still while any caller holds the pointer for another gesture.
     * @returns Gives the pointer back.
     */
    disableDragging(): () => void;
    isDraggingDisabled(): boolean;
}

export class GanttDragging implements IGanttDragging {
    public readonly events = new EventEmitter<IGanttDraggingEvents>();
    private _chart: GanttStatic;
    private _draggedTaskId?: string;
    private _disablers = new Set<symbol>();
    private _eventIds: string[];

    constructor(chart: GanttStatic) {
        this._chart = chart;
        //the plugin resets this config as it starts
        chart.plugins({ drag_timeline: true });
        chart.config.drag_timeline = { ignore: `.${GANTT_DRAGGING_DISABLED_CLASS}, .${GANTT_TASK_LINE_CLASS}` };
        this._eventIds = [
            chart.attachEvent('onBeforeTaskDrag', () => !this.isDraggingDisabled()),
            chart.attachEvent('onTaskDrag', this._onTaskDrag),
            chart.attachEvent('onAfterTaskDrag', this._onAfterTaskDrag),
        ];
    }

    public disableDragging(): () => void {
        const disabler = Symbol();
        this._disablers.add(disabler);
        if (this._disablers.size === 1) {
            this._onDisabledChanged(true);
        }
        return () => {
            if (this._disablers.delete(disabler) && this._disablers.size === 0) {
                this._onDisabledChanged(false);
            }
        };
    }

    public isDraggingDisabled(): boolean {
        return this._disablers.size > 0;
    }

    public destroy(): void {
        this._eventIds.forEach(eventId => this._chart.detachEvent(eventId));
        this._disablers.clear();
        this.events.clearEventListeners();
    }

    private _onDisabledChanged(isDisabled: boolean): void {
        this._chart.$root?.classList.toggle(GANTT_DRAGGING_DISABLED_CLASS, isDisabled);
        this.events.dispatchEvent('onDraggingDisabledChanged', isDisabled);
    }

    //on the first movement since another handler may still refuse the drag
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
