import { IRecord } from "@talxis/client-libraries";
import { ITaskGridServiceLocator } from '@components/TaskGrid/services';
import { IGanttServiceLocator } from '../services';
import { ITaskDataProvider } from '@components/TaskGrid/providers';

export interface IGanttDates {
    getStartDate: (records?: IRecord[]) => Date | null;
    getEndDate: (records?: IRecord[]) => Date | null;
    getStartEndDateFromRecords: (records: IRecord[]) => { startDate: Date | null, endDate: Date | null, startRecord: IRecord | null, endRecord: IRecord | null };
    getStartDateColumnName: () => string;
    getEndDateColumnName: () => string;
    getDateFromString: (dateStr: string) => Date | null;
}

/** Constructor parameters for {@link GanttDates}. */
export interface IGanttDatesParameters {
    /** Where the field mapping and the records are reached. */
    services: IGanttServiceLocator;
}

export class GanttDates implements IGanttDates {
    private _services: IGanttServiceLocator;

    constructor(parameters: IGanttDatesParameters) {
        this._services = parameters.services;
    }

    public getStartDateColumnName(): string {
        return this._services.get('fieldMapping').startDate;
    }

    public getEndDateColumnName(): string {
        return this._services.get('fieldMapping').endDate;
    }

    public getDateFromString(date: string | null): Date | null {
        if (!date) return null;
        return new Date(date);
    }

    /** The earliest start among the given records, or among every loaded task. */
    public getStartDate(records?: IRecord[]): Date | null {
        return this.getStartEndDateFromRecords(records ?? this._provider.getAllRecords()).startDate;
    }

    /** The latest end among the given records, or among every loaded task. */
    public getEndDate(records?: IRecord[]): Date | null {
        return this.getStartEndDateFromRecords(records ?? this._provider.getAllRecords()).endDate;
    }

    public getStartEndDateFromRecords(records: IRecord[]): { startDate: Date | null, endDate: Date | null, startRecord: IRecord | null, endRecord: IRecord | null } {
        const startDateColumnName = this.getStartDateColumnName();
        const endDateColumnName = this.getEndDateColumnName();
        let minDate: Date | null = null;
        let maxDate: Date | null = null;
        let startRecord: IRecord | null = null;
        let endRecord: IRecord | null = null;

        for (const record of records) {
            const startDate = this.getDateFromString(record.getValue(startDateColumnName));
            const endDate = this.getDateFromString(record.getValue(endDateColumnName));

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

    private get _taskGridServices(): ITaskGridServiceLocator {
        return this._services.get('taskGridServices');
    }

    private get _provider(): ITaskDataProvider {
        return this._taskGridServices.get('taskDataProvider');
    }

}