import dayjs from "dayjs";
import type { IGanttNonWorkingDay } from "@talxis/base-controls/controls/task-grid/modules/gantt";

/** Common holidays, plus a few company days, for the sample Gantt. */
export const NON_WORKING_DAYS: IGanttNonWorkingDay[] = [
    { id: 'newYearsDay', date: dayjs('2020-01-01'), description: "New Year's Day", recurrence: 'FREQ=YEARLY' },
    { id: 'goodFriday', date: dayjs('2020-01-01'), description: 'Good Friday', recurrence: 'FREQ=YEARLY;BYEASTER=-2' },
    { id: 'easterMonday', date: dayjs('2020-01-01'), description: 'Easter Monday', recurrence: 'FREQ=YEARLY;BYEASTER=1' },
    { id: 'labourDay', date: dayjs('2020-05-01'), description: 'Labour Day', recurrence: 'FREQ=YEARLY' },
    { id: 'thanksgiving', date: dayjs('2020-01-01'), description: 'Thanksgiving', recurrence: 'FREQ=YEARLY;BYMONTH=11;BYDAY=+4TH' },
    { id: 'christmas', date: dayjs('2020-12-24'), endDate: dayjs('2020-12-26'), description: 'Christmas holidays', recurrence: 'FREQ=YEARLY', data: { greeting: 'Merry Christmas!', isOfficeClosed: true } },
    { id: 'newYearsEve', date: dayjs('2020-12-31'), description: "New Year's Eve", recurrence: 'FREQ=YEARLY' },
    { id: 'offsite', date: dayjs('2025-11-12'), endDate: dayjs('2025-11-14'), description: 'Company offsite' },
    { id: 'releaseFreeze', date: dayjs('2025-10-01'), description: 'Release freeze', recurrence: 'FREQ=MONTHLY;BYDAY=-1FR' },
];
