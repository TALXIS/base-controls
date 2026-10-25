import dayjs from "dayjs";
import { DataTypes, IRecord } from "@talxis/client-libraries";
import type { ITaskRuntime } from "../../../runtime";

/** The task dates the chart draws, read through the task field mapping. */
export interface IGanttDates {
    getStartColumnName(): string;
    getEndColumnName(): string;
    getStartDate(record: IRecord): Date | undefined;
    getEndDate(record: IRecord): Date | undefined;
    /** Whether the column holds a date without a time of day. */
    isDateOnly(columnName: string): boolean;
    /** Whether either date column holds a time of day, which makes the hour levels worth showing. */
    hasTimeOfDay(): boolean;
    /** The earliest start and the latest end of the records. */
    getRange(records: IRecord[]): { startDate: Date; endDate: Date } | undefined;
}

export class GanttDates implements IGanttDates {
    private _taskRuntime: ITaskRuntime;
    private _startColumnName: string;
    private _endColumnName: string;

    constructor(taskRuntime: ITaskRuntime) {
        const { startDate, endDate } = taskRuntime.getFieldMapping();
        if (!startDate || !endDate) {
            throw new Error('TaskGantt needs startDate and endDate in the task field mapping.');
        }
        this._taskRuntime = taskRuntime;
        this._startColumnName = startDate;
        this._endColumnName = endDate;
    }

    public getStartColumnName(): string {
        return this._startColumnName;
    }

    public getEndColumnName(): string {
        return this._endColumnName;
    }

    public getStartDate(record: IRecord): Date | undefined {
        return this._toDate(record.getValue(this._startColumnName));
    }

    public getEndDate(record: IRecord): Date | undefined {
        return this._toDate(record.getValue(this._endColumnName));
    }

    public isDateOnly(columnName: string): boolean {
        return this._taskRuntime.getProvider().getColumnsMap()[columnName]?.dataType === DataTypes.DateAndTimeDateOnly;
    }

    public hasTimeOfDay(): boolean {
        return !this.isDateOnly(this._startColumnName) || !this.isDateOnly(this._endColumnName);
    }

    public getRange(records: IRecord[]): { startDate: Date; endDate: Date } | undefined {
        let startDate: Date | undefined;
        let endDate: Date | undefined;
        for (const record of records) {
            const start = this.getStartDate(record);
            const end = this.getEndDate(record);
            if (start && (!startDate || start < startDate)) {
                startDate = start;
            }
            if (end && (!endDate || end > endDate)) {
                endDate = end;
            }
        }
        return startDate && endDate ? { startDate, endDate } : undefined;
    }

    private _toDate(value: unknown): Date | undefined {
        if (value == null || value === '') {
            return undefined;
        }
        const date = dayjs(value as string | Date);
        return date.isValid() ? date.toDate() : undefined;
    }
}
