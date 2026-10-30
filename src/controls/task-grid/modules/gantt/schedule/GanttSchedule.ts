import dayjs from "dayjs";
import { DataTypes, IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import type { IGantt } from "../interfaces";
import { addClockDuration, getClockDuration } from "./clockTime";

/** Where a task's bar runs; `end` is exclusive, the day after a date-only end. */
export interface IGanttSpan {
    start: Date;
    end: Date;
}

export type GanttSpanEdge = 'start' | 'end';

export interface IGanttDurationParameters {
    span: IGanttSpan;
    /** Absent for a task still being drawn. */
    record?: IRecord;
}

/** Changes a calculated duration in clock minutes, before a day counts as the runtime's hours per day. */
export type GanttDurationHook = (result: { duration: number }, parameters: IGanttDurationParameters) => void;

export interface IGanttSnapParameters {
    /** What the pointer changed: the whole bar, one of its edges, or a span drawn anew. */
    change: 'move' | GanttSpanEdge | 'span';
    /** The span before the change, for a move or an edge. */
    original?: IGanttSpan;
}

/** Changes a span after it is snapped to the scale, such as to keep it off certain days. */
export type GanttSnapHook = (result: { span: IGanttSpan }, parameters: IGanttSnapParameters) => void;

/** The `schedule` service: how a task's record maps to the span its bar runs over, and back. */
export interface IGanttSchedule {
    /** The display names of the start and end columns. */
    getLabels(): { start: string; end: string };
    /** Whether either date column holds a time of day. */
    hasTimeOfDay(): boolean;
    /** Where the record's bar runs, or `undefined` while it has no valid dates. */
    getSpan(record: IRecord): IGanttSpan | undefined;
    /** The record's start or end, or `undefined` while that column holds no valid date. */
    getDate(record: IRecord, edge: GanttSpanEdge): Date | undefined;
    /** From the earliest start to the latest end. */
    getRange(records: IRecord[]): IGanttSpan | undefined;
    /** How long the task takes in minutes: the mapped value, or the calculated one when no duration column is mapped. */
    getDuration(record: IRecord): number | undefined;
    calculateDuration(span: IGanttSpan, record?: IRecord): number;
    /**
     * Registers a hook over each calculated duration.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerDuration(hook: GanttDurationHook, priority?: number): () => void;
    /**
     * Registers a hook over each span a drag or a drawn task snaps to.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerSnap(hook: GanttSnapHook, priority?: number): () => void;
    /** The minutes a dragged edge snaps by at the current zoom. */
    getSnapMinutes(edge: GanttSpanEdge): number;
    /**
     * Snaps one edge, keeping at least one step to the other.
     * @param original The span before the edge was dragged.
     */
    snapEdge(span: IGanttSpan, edge: GanttSpanEdge, original?: IGanttSpan): IGanttSpan;
    /** Snaps the start and keeps the clock-time length of `lengthOf`. */
    snapMove(span: IGanttSpan, lengthOf: IGanttSpan): IGanttSpan;
    /** Snaps both edges, keeping at least one step between them. */
    snapSpan(span: IGanttSpan): IGanttSpan;
    /** The values the columns take for a span: dates as the record keeps them, and the duration when one is mapped. */
    getValues(span: IGanttSpan, record?: IRecord): { [columnName: string]: unknown };
    /** Writes a span to its record, saved as an edit in the grid is. */
    save(record: IRecord, span: IGanttSpan): void;
    /** The span's dates as the record shows them; `range` is a single date when both are the same. */
    format(span: IGanttSpan): { start: string; end: string; range: string };
    /** Minutes as the duration column shows them. */
    formatDuration(duration: number): string;
}

interface ISnapStep {
    unit: 'minute' | 'hour' | 'day';
    step: number;
    minutes: number;
}

const MIN_SNAP_WIDTH = 12;
const DAY_STEP: ISnapStep = { unit: 'day', step: 1, minutes: 1440 };
const TIME_STEPS: ISnapStep[] = [
    { unit: 'minute', step: 15, minutes: 15 },
    { unit: 'minute', step: 30, minutes: 30 },
    { unit: 'hour', step: 1, minutes: 60 },
    { unit: 'hour', step: 3, minutes: 180 },
    { unit: 'hour', step: 6, minutes: 360 },
    { unit: 'hour', step: 12, minutes: 720 },
];

export class GanttSchedule implements IGanttSchedule {
    private _gantt: IGantt;
    private _columnNames: { start: string; end: string; duration?: string };
    private _durationHooks = new HookRegistry<GanttDurationHook>();
    private _snapHooks = new HookRegistry<GanttSnapHook>();

    constructor(gantt: IGantt) {
        const { startDate, endDate, duration } = gantt.getTaskRuntime().getFieldMapping();
        if (!startDate || !endDate) {
            throw new Error('TaskGantt needs startDate and endDate in the task field mapping.');
        }
        this._gantt = gantt;
        this._columnNames = { start: startDate, end: endDate, duration };
    }

    public getLabels(): { start: string; end: string } {
        const columns = this._gantt.getTaskRuntime().getProvider().getColumnsMap();
        const { start, end } = this._columnNames;
        return { start: columns[start]?.displayName ?? start, end: columns[end]?.displayName ?? end };
    }

    public hasTimeOfDay(): boolean {
        return !this._isDateOnly('start') || !this._isDateOnly('end');
    }

    public getSpan(record: IRecord): IGanttSpan | undefined {
        const start = this.getDate(record, 'start');
        const end = this.getDate(record, 'end');
        if (!start || !end || end < start) {
            return undefined;
        }
        return { start, end: this._isDateOnly('end') ? dayjs(end).add(1, 'day').toDate() : end };
    }

    public getRange(records: IRecord[]): IGanttSpan | undefined {
        let range: IGanttSpan | undefined;
        for (const record of records) {
            const span = this.getSpan(record);
            if (span) {
                range = range ? { start: span.start < range.start ? span.start : range.start, end: span.end > range.end ? span.end : range.end } : span;
            }
        }
        return range;
    }

    public getDuration(record: IRecord): number | undefined {
        const durationColumnName = this._columnNames.duration;
        if (durationColumnName) {
            const value = record.getValue(durationColumnName);
            return value == null || value === '' || !Number.isFinite(Number(value)) ? undefined : Number(value);
        }
        const span = this.getSpan(record);
        return span && this.calculateDuration(span, record);
    }

    public calculateDuration(span: IGanttSpan, record?: IRecord): number {
        const result = { duration: getClockDuration(span.start, span.end) / 60_000 };
        this._durationHooks.apply(result, { span, record });
        return this._toWorkingMinutes(result.duration);
    }

    public registerDuration(hook: GanttDurationHook, priority?: number): () => void {
        return this._durationHooks.register(hook, priority);
    }

    public registerSnap(hook: GanttSnapHook, priority?: number): () => void {
        return this._snapHooks.register(hook, priority);
    }

    public getSnapMinutes(edge: GanttSpanEdge): number {
        return this._getSnapStep(edge).minutes;
    }

    public snapEdge(span: IGanttSpan, edge: GanttSpanEdge, original?: IGanttSpan): IGanttSpan {
        return this._applySnapHooks(this._snapEdgeToScale(span, edge), { change: edge, original });
    }

    public snapMove(span: IGanttSpan, lengthOf: IGanttSpan): IGanttSpan {
        const start = this._snapDate(span.start, 'start');
        return this._applySnapHooks({ start, end: addClockDuration(start, getClockDuration(lengthOf.start, lengthOf.end)) }, { change: 'move', original: lengthOf });
    }

    public snapSpan(span: IGanttSpan): IGanttSpan {
        return this._applySnapHooks(this._snapEdgeToScale({ start: this._snapDate(span.start, 'start'), end: span.end }, 'end'), { change: 'span' });
    }

    private _applySnapHooks(span: IGanttSpan, parameters: IGanttSnapParameters): IGanttSpan {
        const result = { span };
        this._snapHooks.apply(result, parameters);
        return result.span;
    }

    private _snapEdgeToScale(span: IGanttSpan, edge: GanttSpanEdge): IGanttSpan {
        const { unit, step } = this._getSnapStep(edge);
        const date = this._gantt.services.get('chart').date;
        if (edge === 'start') {
            const latestStart = date.add(span.end, -step, unit);
            return { start: new Date(Math.min(+this._snapDate(span.start, 'start'), +latestStart)), end: span.end };
        }
        const earliestEnd = date.add(span.start, step, unit);
        return { start: span.start, end: new Date(Math.max(+this._snapDate(span.end, 'end'), +earliestEnd)) };
    }

    public getValues(span: IGanttSpan, record?: IRecord): { [columnName: string]: unknown } {
        const { start, end, duration } = this._columnNames;
        const values: { [columnName: string]: unknown } = { [start]: span.start, [end]: this._toRecordEnd(span.end) };
        if (duration) {
            values[duration] = Math.round(this.calculateDuration(span, record));
        }
        return values;
    }

    public save(record: IRecord, span: IGanttSpan): void {
        const endColumnName = this._columnNames.end;
        const { [endColumnName]: end, ...values } = this.getValues(span, record);
        Object.entries(values).forEach(([columnName, value]) => record.setValue(columnName, value));
        //last and through the grid's field, which saves the record as an edit in the grid does
        this._gantt.services.get('grid').services.get('fields').get(record, endColumnName).setValue(end);
    }

    public format(span: IGanttSpan): { start: string; end: string; range: string } {
        const provider = this._gantt.getTaskRuntime().getProvider();
        const columns = provider.getColumnsMap();
        const formatting = provider.getFormatting();
        const start = formatting.format({ value: span.start, column: columns[this._columnNames.start] }) ?? '';
        const end = formatting.format({ value: this._toRecordEnd(span.end), column: columns[this._columnNames.end] }) ?? '';
        return { start, end, range: start === end ? start : `${start} – ${end}` };
    }

    public formatDuration(duration: number): string {
        const taskRuntime = this._gantt.getTaskRuntime();
        return taskRuntime.getProvider().getFormatting().formatDuration(duration, taskRuntime.getHoursPerDay());
    }

    //a whole day holds the runtime's hours, and part of a day never more than that
    private _toWorkingMinutes(clockMinutes: number): number {
        const minutesPerDay = this._gantt.getTaskRuntime().getHoursPerDay() * 60;
        const days = Math.floor(clockMinutes / 1440);
        return days * minutesPerDay + Math.min(clockMinutes - days * 1440, minutesPerDay);
    }

    //a date-only value is the local day it falls on, as the record saves it
    public getDate(record: IRecord, edge: GanttSpanEdge): Date | undefined {
        const value = record.getValue(this._columnNames[edge]);
        if (value == null || value === '') {
            return undefined;
        }
        const date = dayjs(value as string | Date);
        if (!date.isValid()) {
            return undefined;
        }
        return this._isDateOnly(edge) ? date.startOf('day').toDate() : date.toDate();
    }

    private _toRecordEnd(end: Date): Date {
        return this._isDateOnly('end') ? dayjs(end).subtract(1, 'day').toDate() : end;
    }

    private _isDateOnly(edge: GanttSpanEdge): boolean {
        return this._gantt.getTaskRuntime().getProvider().getColumnsMap()[this._columnNames[edge]]?.dataType === DataTypes.DateAndTimeDateOnly;
    }

    private _snapDate(date: Date, edge: GanttSpanEdge): Date {
        const { unit, step } = this._getSnapStep(edge);
        return this._gantt.services.get('chart').roundDate({ date, unit, step });
    }

    private _getSnapStep(edge: GanttSpanEdge): ISnapStep {
        if (this._isDateOnly(edge)) {
            return DAY_STEP;
        }
        const pixelsPerDay = this._gantt.services.find('zooming')?.getPixelsPerDay() ?? 0;
        return TIME_STEPS.find(snapStep => pixelsPerDay * snapStep.minutes / 1440 >= MIN_SNAP_WIDTH) ?? DAY_STEP;
    }
}
