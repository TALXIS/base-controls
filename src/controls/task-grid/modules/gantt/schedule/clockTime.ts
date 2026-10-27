import dayjs from "dayjs";

/** The milliseconds between two dates as a clock reads them. */
export const getClockDuration = (startDate: Date, endDate: Date): number => {
    return dayjs(endDate).diff(startDate) + (dayjs(endDate).utcOffset() - dayjs(startDate).utcOffset()) * 60_000;
};

/** The date a clock shows `duration` milliseconds after `date`. */
export const addClockDuration = (date: Date, duration: number): Date => {
    const end = dayjs(date).add(duration, 'millisecond');
    return end.add(dayjs(date).utcOffset() - end.utcOffset(), 'minute').toDate();
};
