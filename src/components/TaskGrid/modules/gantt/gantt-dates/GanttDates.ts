import dayjs from 'dayjs';
import { DataTypes, IRecord } from "@talxis/client-libraries";
import { ITaskGridServiceLocator } from '@components/TaskGrid/services';
import { IGanttServiceLocator } from '../services';
import { ITaskDataProvider } from '@components/TaskGrid/providers';

/** Whether a date column carries a time of day, or only a date. */
export type IGanttDatePrecision = 'date' | 'dateTime';

export interface IGanttDates {
    getStartEndDateFromRecords: (records: IRecord[]) => { startDate: Date | null, endDate: Date | null, startRecord: IRecord | null, endRecord: IRecord | null };
    /** One task's start. */
    getStartDate: (record: IRecord) => Date | null;
    /** One task's end. */
    getEndDate: (record: IRecord) => Date | null;
    getStartDatePrecision: () => IGanttDatePrecision;
    getEndDatePrecision: () => IGanttDatePrecision;
    /** Whether either mapped column carries a time of day. What makes an hour scale worth showing. */
    hasTimeOfDay: () => boolean;
}

export interface IGanttDatesParameters {
    /** Where the field mapping and the records are reached. */
    services: IGanttServiceLocator;
}

/**
 * What the mapped date columns mean: the precision they hold, and how a value of theirs becomes a date.
 *
 * A record hands over a date column's value as a string — a calendar day for a date-only column, an
 * instant for a date-time one — and takes one back the same way, dropping a time the column cannot keep.
 * So nothing here truncates a date; a value is read with the same parser the record wrote it with, which
 * puts a calendar day at local midnight rather than at UTC midnight.
 */
export class GanttDates implements IGanttDates {
    private _services: IGanttServiceLocator;

    constructor(parameters: IGanttDatesParameters) {
        this._services = parameters.services;
    }

    public getStartDatePrecision(): IGanttDatePrecision {
        return this._getPrecision(this._services.get('fieldMapping').startDate);
    }

    public getEndDatePrecision(): IGanttDatePrecision {
        return this._getPrecision(this._services.get('fieldMapping').endDate);
    }

    public hasTimeOfDay(): boolean {
        return this.getStartDatePrecision() === 'dateTime' || this.getEndDatePrecision() === 'dateTime';
    }

    public getStartDate(record: IRecord): Date | null {
        return this._toDate(record.getValue(this._services.get('fieldMapping').startDate));
    }

    public getEndDate(record: IRecord): Date | null {
        return this._toDate(record.getValue(this._services.get('fieldMapping').endDate));
    }

    public getStartEndDateFromRecords(records: IRecord[]): { startDate: Date | null, endDate: Date | null, startRecord: IRecord | null, endRecord: IRecord | null } {
        let minDate: Date | null = null;
        let maxDate: Date | null = null;
        let startRecord: IRecord | null = null;
        let endRecord: IRecord | null = null;

        for (const record of records) {
            const startDate = this.getStartDate(record);
            const endDate = this.getEndDate(record);

            if (startDate && (!minDate || startDate.getTime() < minDate.getTime())) {
                minDate = startDate;
                startRecord = record;
            }

            if (endDate && (!maxDate || endDate.getTime() > maxDate.getTime())) {
                maxDate = endDate;
                endRecord = record;
            }
        }
        return {
            startDate: minDate,
            endDate: maxDate,
            startRecord,
            endRecord,
        }
    }

    //the column's own data type, which is what the rest of the grid switches on too
    private _getPrecision(columnName: string): IGanttDatePrecision {
        const column = this._taskDataProvider.getColumnsMap()[columnName];
        return column?.dataType === DataTypes.DateAndTimeDateOnly ? 'date' : 'dateTime';
    }

    private _toDate(value: unknown): Date | null {
        if (!value) {
            return null;
        }
        const date = dayjs(value as string | Date);
        return date.isValid() ? date.toDate() : null;
    }

    private get _taskGridServices(): ITaskGridServiceLocator {
        return this._services.get('taskGridServices');
    }

    private get _taskDataProvider(): ITaskDataProvider {
        return this._taskGridServices.get('taskDataProvider');
    }

}
