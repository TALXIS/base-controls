import { HookRegistry } from "@utils";
import type { GanttStatic, Task } from "dhtmlx-gantt";
import type { GridApi, IRowNode } from "ag-grid-community";
import type { IRecord } from "@talxis/client-libraries";
import type { ITaskDataProviderEvents } from "../../../provider";
import type { ITaskRuntime } from "../../../runtime";
import type { IGantt } from "../interfaces";
import { GANTT_TASK_DONE_CLASS, GANTT_TASK_INACTIVE_CLASS, GANTT_TASK_LOCKED_CLASS, GANTT_TASK_STARTED_CLASS, GANTT_TASK_SUMMARY_CLASS } from "../chart/classNames";
import type { IGanttSchedule } from "../schedule/GanttSchedule";
import { GanttTaskMotion } from "./GanttTaskMotion";

/** The chart's tasks: exactly the rows the grid displays, in its order and at its row heights. */
export interface IGanttTasks {
    getRecord(taskId: string): IRecord | undefined;
    /** Whether the task's record is locked against edits, as the grid beside it decides. */
    isLocked(taskId: string): boolean;
    /** The displayed tasks, top down. */
    getTaskIds(): string[];
    /**
     * Registers a hook over each task as it is handed to the chart.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerTask(hook: GanttTaskHook, priority?: number): () => void;
    /**
     * Registers a hook over the class names of each bar.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerTaskClass(hook: GanttTaskClassHook, priority?: number): () => void;
    /** The class names of a task's bar, from the class hooks. */
    getTaskClass(task: Task): string;
    /**
     * Registers a hook over the class names of each task's row.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerRowClass(hook: GanttTaskClassHook, priority?: number): () => void;
    /** The class names of a task's row, from the row class hooks. */
    getRowClass(task: Task): string;
    /** Rebuilds every task, such as after what a task hook reads has changed. */
    parse(): void;
}

export interface IGanttTaskParameters {
    record: IRecord;
}

/** Changes a task in place, such as its `color`, `type` or `readonly`, before the chart draws it. */
export type GanttTaskHook = (task: Task, parameters: IGanttTaskParameters) => void;

export interface IGanttTaskClassParameters {
    record: IRecord;
    task: Task;
}

/** Adds to the class names of a task's bar or row. */
export type GanttTaskClassHook = (classNames: string[], parameters: IGanttTaskClassParameters) => void;

const SUMMARY_BAR_HEIGHT = 12;
/** How tall a task's bar is drawn, other than a summary's. */
export const TASK_BAR_HEIGHT = 20;

export interface IGanttTasksParameters {
    gantt: GanttStatic;
    gridApi: GridApi<IRecord>;
    runtime: IGantt;
    schedule: IGanttSchedule;
    onParsed: (isFirstLoad: boolean) => void;
}

export class GanttTasks implements IGanttTasks {
    private _gantt: GanttStatic;
    private _gridApi: GridApi<IRecord>;
    private _runtime: IGantt;
    private _taskRuntime: ITaskRuntime;
    private _schedule: IGanttSchedule;
    private _onParsed: (isFirstLoad: boolean) => void;
    private _taskIds: string[] = [];
    private _taskIndexes = new Map<string, number>();
    private _isFirstLoad = true;
    private _scheduledFrame?: number;
    private _pendingUpdates = new Map<string, IRecord>();
    private _scheduledUpdateFrame?: number;
    private _unregisters: (() => void)[] = [];
    private _motion: GanttTaskMotion;
    private _taskHooks = new HookRegistry<GanttTaskHook>();
    private _taskClassHooks = new HookRegistry<GanttTaskClassHook>();
    private _rowClassHooks = new HookRegistry<GanttTaskClassHook>();

    constructor(parameters: IGanttTasksParameters) {
        this._gantt = parameters.gantt;
        this._gridApi = parameters.gridApi;
        this._runtime = parameters.runtime;
        this._taskRuntime = parameters.runtime.getTaskRuntime();
        this._schedule = parameters.schedule;
        this._onParsed = parameters.onParsed;
        this._motion = new GanttTaskMotion(this._gantt);
        const provider = this._taskRuntime.getProvider();
        this._gantt.templates.task_class = (_start: Date, _end: Date, task: Task) => this.getTaskClass(task);
        this._gantt.templates.task_row_class = (_start: Date, _end: Date, task: Task) => this.getRowClass(task);
        //the grid beside it shows each task's name on the same row
        this._gantt.templates.task_text = () => '';
        //the chart scans a task's siblings for its index, twice per render
        this._gantt.getTaskIndex = (taskId: string | number) => this._taskIndexes.get(String(taskId)) ?? -1;
        this._gridApi.addEventListener('modelUpdated', this._scheduleParse);
        provider.addEventListener('onRecordColumnValueChanged', this._onRecordColumnValueChanged);
        provider.taskEvents.addEventListener('onTasksUpdated', this._onTasksUpdated);
        this._unregisters.push(
            () => !this._gridApi.isDestroyed() && this._gridApi.removeEventListener('modelUpdated', this._scheduleParse),
            () => provider.removeEventListener('onRecordColumnValueChanged', this._onRecordColumnValueChanged),
            () => provider.taskEvents.removeEventListener('onTasksUpdated', this._onTasksUpdated),
        );
    }

    public getRecord(taskId: string): IRecord | undefined {
        return this._taskRuntime.getProvider().getRecordsMap()[taskId];
    }

    public isLocked(taskId: string): boolean {
        const record = this.getRecord(taskId);
        return !!record && !!this._runtime.services.get('grid').modules.find('editing')?.locks.get({ record }).isLocked;
    }

    public getTaskIds(): string[] {
        return this._taskIds;
    }

    public registerTask(hook: GanttTaskHook, priority?: number): () => void {
        return this._taskHooks.register(hook, priority);
    }

    public registerTaskClass(hook: GanttTaskClassHook, priority?: number): () => void {
        return this._taskClassHooks.register(hook, priority);
    }

    public getTaskClass(task: Task): string {
        const record = this.getRecord(String(task.id));
        if (!record) {
            return '';
        }
        const classNames = this._isSummary(record.getRecordId()) ? [GANTT_TASK_SUMMARY_CLASS] : [];
        //a summary's end caps fill as its progress reaches them
        if ((task.progress ?? 0) > 0) {
            classNames.push(GANTT_TASK_STARTED_CLASS);
        }
        if ((task.progress ?? 0) >= 1) {
            classNames.push(GANTT_TASK_DONE_CLASS);
        }
        if (!this._taskRuntime.getProvider().isRecordActive(record.getRecordId())) {
            classNames.push(GANTT_TASK_INACTIVE_CLASS);
        }
        if (this.isLocked(record.getRecordId())) {
            classNames.push(GANTT_TASK_LOCKED_CLASS);
        }
        this._taskClassHooks.apply(classNames, { record, task });
        return classNames.join(' ');
    }

    public registerRowClass(hook: GanttTaskClassHook, priority?: number): () => void {
        return this._rowClassHooks.register(hook, priority);
    }

    public getRowClass(task: Task): string {
        const record = this.getRecord(String(task.id));
        if (!record) {
            return '';
        }
        const classNames: string[] = [];
        this._rowClassHooks.apply(classNames, { record, task });
        return classNames.join(' ');
    }

    public parse(): void {
        this._cancelScheduledParse();
        if (this._gridApi.isDestroyed()) {
            return;
        }
        const tasks: Task[] = [];
        const branchSizes = new Map<string | undefined, number>();
        this._taskIndexes = new Map();
        for (let index = 0; index < this._gridApi.getDisplayedRowCount(); index++) {
            const node = this._gridApi.getDisplayedRowAtIndex(index);
            if (!node?.data) {
                continue;
            }
            const task = this._toTask(node.data, node);
            //the grid's tree, as the chart slows down with the size of a branch
            const parentId = this._getDisplayedParentId(node);
            const branchIndex = branchSizes.get(parentId) ?? 0;
            branchSizes.set(parentId, branchIndex + 1);
            this._taskIndexes.set(String(task.id), branchIndex);
            tasks.push({ ...task, parent: parentId, open: true });
        }
        const before = this._isFirstLoad ? new Map() : this._motion.capture(this._taskIds);
        this._taskIds = tasks.map(task => String(task.id));
        this._gantt.batchUpdate(() => {
            this._gantt.clearAll();
            this._gantt.parse({ data: tasks });
        });
        this._motion.play(before);
        this._onParsed(this._isFirstLoad);
        this._isFirstLoad = false;
    }

    public destroy(): void {
        this._cancelScheduledParse();
        if (this._scheduledUpdateFrame !== undefined) {
            cancelAnimationFrame(this._scheduledUpdateFrame);
        }
        this._unregisters.forEach(unregister => unregister());
    }

    //AG Grid fires it once per change it batches; one parse per frame covers them
    private _scheduleParse = (): void => {
        this._scheduledFrame ??= requestAnimationFrame(() => this.parse());
    };

    private _cancelScheduledParse(): void {
        if (this._scheduledFrame !== undefined) {
            cancelAnimationFrame(this._scheduledFrame);
            this._scheduledFrame = undefined;
        }
    }

    //a task hook may read any column
    private _onRecordColumnValueChanged = (record: IRecord): void => {
        this._scheduleUpdate([record]);
    };

    private _onTasksUpdated: ITaskDataProviderEvents['onTasksUpdated'] = records => {
        this._scheduleUpdate(records);
    };

    //a change writing both dates would otherwise draw the task between the two writes
    private _scheduleUpdate(records: IRecord[]): void {
        records.forEach(record => this._pendingUpdates.set(record.getRecordId(), record));
        this._scheduledUpdateFrame ??= requestAnimationFrame(() => {
            this._scheduledUpdateFrame = undefined;
            const pending = [...this._pendingUpdates.values()];
            this._pendingUpdates.clear();
            this._updateTasks(pending);
        });
    }

    private _updateTasks(records: IRecord[]): void {
        const before = this._motion.capture(records.map(record => record.getRecordId()));
        this._gantt.batchUpdate(() => {
            for (const record of records) {
                const taskId = record.getRecordId();
                if (!this._gantt.isTaskExists(taskId)) {
                    continue;
                }
                const task = this._gantt.getTask(taskId);
                Object.assign(task, this._toTask(record, this._gridApi.getRowNode(taskId)));
                this._gantt.updateTask(taskId);
            }
        });
        this._motion.play(before);
    }

    private _toTask(record: IRecord, node?: IRowNode<IRecord>): Task {
        const taskId = record.getRecordId();
        const span = this._schedule.getSpan(record);
        const task = {
            id: taskId,
            text: record.getNamedReference().name ?? '',
            start_date: span?.start,
            end_date: span?.end,
            unscheduled: !span,
            progress: this._getProgress(record),
            row_height: node?.rowHeight ?? undefined,
            bar_height: this._isSummary(taskId) ? SUMMARY_BAR_HEIGHT : TASK_BAR_HEIGHT,
            type: span && +span.end === +span.start ? 'milestone' : 'task',
        } as Task;
        this._taskHooks.apply(task, { record });
        return task;
    }

    //rows come parent first, so a displayed parent is already indexed
    private _getDisplayedParentId(node: IRowNode<IRecord>): string | undefined {
        const parentId = this._taskRuntime.isFlatList() ? undefined : node.parent?.data?.getRecordId();
        return parentId !== undefined && this._taskIndexes.has(parentId) ? parentId : undefined;
    }

    //a parent spans its children, so it is drawn as a slim bar over them
    private _isSummary(taskId: string): boolean {
        return !this._taskRuntime.isFlatList() && this._taskRuntime.getProvider().getRecordTree().view.hasChildren(taskId);
    }

    private _getProgress(record: IRecord): number {
        const columnName = this._taskRuntime.getFieldMapping().percentComplete;
        return columnName ? (Number(record.getValue(columnName)) || 0) / 100 : 0;
    }
}
