import dayjs from "dayjs";
import { DataTypes, IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@core";
import type { IGantt } from "../interfaces";
import { addClockDuration, getClockDuration } from "./clockTime";
import { MILLISECONDS_PER_MINUTE, MINUTES_PER_DAY, MINUTES_PER_HOUR } from "./timeUnits";

/** Where a task's bar runs, with `end` exclusive like the day after a date-only end. */
export interface IGanttSpan {
    start: Date;
    end: Date;
}

export type GanttSpanEdge = 'start' | 'end';

export interface IGanttDurationHookParameters {
    span: IGanttSpan;
    /** Absent for a task still being drawn. */
    record?: IRecord;
}

/** Changes a calculated duration in clock minutes. */
export type GanttDurationHook = (result: { duration: number }, parameters: IGanttDurationHookParameters) => void;

export interface IGanttSnapHookParameters {
    /** What the pointer changed: the whole bar, one of its edges, or a span drawn anew. */
    change: 'move' | GanttSpanEdge | 'span';
    /** The span before the change, for a move or an edge. */
    original?: IGanttSpan;
}

/** Changes a span after it is snapped to the scale, such as to keep it off certain days. */
export type GanttSnapHook = (result: { span: IGanttSpan }, parameters: IGanttSnapHookParameters) => void;

/** The `schedule` service: how a task's record maps to the span its bar runs over, and back. */
export interface IGanttSchedule {
    /** The display names of the start and end columns. */
    getColumnLabels(): { start: string; end: string };
    /** Whether either date column holds a time of day. */
    hasTimeOfDay(): boolean;
    /** Where the record's bar runs, or `undefined` while it has no valid dates. */
    getSpan(record: IRecord): IGanttSpan | undefined;
    /** The record's start or end, or `undefined` while that column holds no valid date. */
    getDate(record: IRecord, edge: GanttSpanEdge): Date | undefined;
    /** From the earliest start to the latest end. */
    getRange(records: IRecord[]): IGanttSpan | undefined;
    /** The task's duration in minutes, mapped or else calculated. */
    getDuration(record: IRecord): number | undefined;
    calculateDuration(span: IGanttSpan, record?: IRecord): number;
    /**
     * Adds a hook over each calculated duration.
     * @param priority Ascending: a higher number runs later.
     */
    addDurationHook(hook: GanttDurationHook, priority?: number): () => void;
    /**
     * Adds a hook over each span a drag or a drawn task snaps to.
     * @param priority Ascending: a higher number runs later.
     */
    addSnapHook(hook: GanttSnapHook, priority?: number): () => void;
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
    /** The column values for a span, the duration among them when one is mapped. */
    getColumnValues(span: IGanttSpan, record?: IRecord): { [columnName: string]: unknown };
    /** Writes a span to its record, saved as an edit in the grid is. */
    save(record: IRecord, span: IGanttSpan): void;
    /** The span's start, end and range as the record shows them. */
    formatSpan(span: IGanttSpan): { start: string; end: string; range: string };
    /** Minutes as the duration column shows them. */
    formatDuration(duration: number): string;
}

interface ISnapStep {
    unit: 'minute' | 'hour' | 'day';
    step: number;
    minutes: number;
}

const MIN_SNAP_WIDTH = 12;
const DAY_STEP: ISnapStep = { unit: 'day', step: 1, minutes: MINUTES_PER_DAY };
const TIME_STEPS: ISnapStep[] = [
    { unit: 'minute', step: 15, minutes: 15 },
    { unit: 'minute', step: 30, minutes: 30 },
    { unit: 'hour', step: 1, minutes: MINUTES_PER_HOUR },
    { unit: 'hour', step: 3, minutes: 3 * MINUTES_PER_HOUR },
    { unit: 'hour', step: 6, minutes: 6 * MINUTES_PER_HOUR },
    { unit: 'hour', step: 12, minutes: 12 * MINUTES_PER_HOUR },
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

    public getColumnLabels(): { start: string; end: string } {
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
        const result = { duration: getClockDuration(span.start, span.end) / MILLISECONDS_PER_MINUTE };
        this._durationHooks.apply(result, { span, record });
        return this._toWorkingMinutes(result.duration);
    }

    public addDurationHook(hook: GanttDurationHook, priority?: number): () => void {
        return this._durationHooks.add(hook, priority);
    }

    public addSnapHook(hook: GanttSnapHook, priority?: number): () => void {
        return this._snapHooks.add(hook, priority);
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

    public getColumnValues(span: IGanttSpan, record?: IRecord): { [columnName: string]: unknown } {
        const { start, end, duration } = this._columnNames;
        const values: { [columnName: string]: unknown } = { [start]: span.start, [end]: this._toRecordEnd(span.end) };
        if (duration) {
            values[duration] = Math.round(this.calculateDuration(span, record));
        }
        return values;
    }

    public save(record: IRecord, span: IGanttSpan): void {
        const endColumnName = this._columnNames.end;
        const { [endColumnName]: end, ...values } = this.getColumnValues(span, record);
        Object.entries(values).forEach(([columnName, value]) => record.setValue(columnName, value));
        //written last through the grid's field so it saves as a grid edit
        this._gantt.services.get('grid').services.get('fields').get(record, endColumnName).setValue(end);
    }

    public formatSpan(span: IGanttSpan): { start: string; end: string; range: string } {
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

    //a date-only value is the local day the record saves
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

    private _applySnapHooks(span: IGanttSpan, parameters: IGanttSnapHookParameters): IGanttSpan {
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

    //a day counts at most the runtime's hours
    private _toWorkingMinutes(clockMinutes: number): number {
        const minutesPerDay = this._gantt.getTaskRuntime().getHoursPerDay() * MINUTES_PER_HOUR;
        const days = Math.floor(clockMinutes / MINUTES_PER_DAY);
        return days * minutesPerDay + Math.min(clockMinutes - days * MINUTES_PER_DAY, minutesPerDay);
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
        return TIME_STEPS.find(snapStep => pixelsPerDay * snapStep.minutes / MINUTES_PER_DAY >= MIN_SNAP_WIDTH) ?? DAY_STEP;
    }
}
