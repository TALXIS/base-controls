import dayjs, { Dayjs } from "dayjs";
import { RRule } from "rrule";
import type { IGanttNonWorkingDay } from "./GanttNonWorkingDays";

interface ICalendarEntry<TData> {
    day: IGanttNonWorkingDay<TData>;
    start: Dayjs;
    spanDays: number;
    rule?: RRule;
}

const getDayKey = (date: Dayjs): string => date.format('YYYY-MM-DD');

//rrule reads and writes dates as UTC, so a local day travels as the same UTC day
const toRuleDate = (date: Dayjs): Date => new Date(Date.UTC(date.year(), date.month(), date.date()));
const fromRuleDate = (date: Date): Dayjs => dayjs(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

/** The days each non-working day covers, worked out one year at a time. */
export class NonWorkingDayCalendar<TData> {
    private _entries: ICalendarEntry<TData>[];
    private _years = new Map<number, Map<string, IGanttNonWorkingDay<TData>[]>>();

    constructor(days: IGanttNonWorkingDay<TData>[]) {
        this._entries = days.map(day => {
            const start = day.date.startOf('day');
            const spanDays = day.endDate ? Math.max(0, day.endDate.startOf('day').diff(start, 'day')) : 0;
            const rule = day.recurrence ? new RRule({ ...RRule.parseString(day.recurrence), dtstart: toRuleDate(start) }) : undefined;
            return { day, start, spanDays, rule };
        });
    }

    public getDays(date: Date): IGanttNonWorkingDay<TData>[] {
        const day = dayjs(date);
        return this._getYear(day.year()).get(getDayKey(day)) ?? [];
    }

    public isNonWorkingDay(date: Date): boolean {
        return this.getDays(date).length > 0;
    }

    /** The milliseconds between two dates that fall on working days. */
    public getWorkingDuration(startDate: Date, endDate: Date): number {
        let duration = 0;
        let day = dayjs(startDate).startOf('day');
        while (day.valueOf() < +endDate) {
            const nextDay = day.add(1, 'day');
            if (!this.isNonWorkingDay(day.toDate())) {
                duration += Math.min(nextDay.valueOf(), +endDate) - Math.max(day.valueOf(), +startDate);
            }
            day = nextDay;
        }
        return duration;
    }

    private _getYear(year: number): Map<string, IGanttNonWorkingDay<TData>[]> {
        const cached = this._years.get(year);
        if (cached) {
            return cached;
        }
        const days = new Map<string, IGanttNonWorkingDay<TData>[]>();
        const yearStart = dayjs(new Date(year, 0, 1));
        for (const entry of this._entries) {
            for (const start of this._getStartsTouching(entry, yearStart)) {
                for (let offset = 0; offset <= entry.spanDays; offset++) {
                    const covered = start.add(offset, 'day');
                    if (covered.year() === year) {
                        const key = getDayKey(covered);
                        days.set(key, [...(days.get(key) ?? []), entry.day]);
                    }
                }
            }
        }
        this._years.set(year, days);
        return days;
    }

    private _getStartsTouching(entry: ICalendarEntry<TData>, yearStart: Dayjs): Dayjs[] {
        if (!entry.rule) {
            return [entry.start];
        }
        const from = toRuleDate(yearStart.subtract(entry.spanDays, 'day'));
        const to = toRuleDate(yearStart.endOf('year').startOf('day'));
        return entry.rule.between(from, to, true).map(fromRuleDate);
    }
}
