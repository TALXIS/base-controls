import dayjs from "dayjs";
import { MILLISECONDS_PER_MINUTE } from "./timeUnits";

/** The milliseconds between two dates as a clock reads them. */
export const getClockDuration = (startDate: Date, endDate: Date): number => {
    return dayjs(endDate).diff(startDate) + (dayjs(endDate).utcOffset() - dayjs(startDate).utcOffset()) * MILLISECONDS_PER_MINUTE;
};

/** The date a clock shows `duration` milliseconds after `date`. */
export const addClockDuration = (date: Date, duration: number): Date => {
    const end = dayjs(date).add(duration, 'millisecond');
    return end.add(dayjs(date).utcOffset() - end.utcOffset(), 'minute').toDate();
};
