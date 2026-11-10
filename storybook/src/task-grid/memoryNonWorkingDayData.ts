import type { IMemoryNonWorkingDay } from "@talxis/base-controls/controls/task-grid/gantt";

/** Common holidays, plus a few company days, for the sample Gantt. */
export const NON_WORKING_DAYS: IMemoryNonWorkingDay[] = [
    { id: 'newYearsDay', date: '2020-01-01', description: "New Year's Day", recurrence: 'FREQ=YEARLY' },
    { id: 'goodFriday', date: '2020-01-01', description: 'Good Friday', recurrence: 'FREQ=YEARLY;BYEASTER=-2' },
    { id: 'easterMonday', date: '2020-01-01', description: 'Easter Monday', recurrence: 'FREQ=YEARLY;BYEASTER=1' },
    { id: 'labourDay', date: '2020-05-01', description: 'Labour Day', recurrence: 'FREQ=YEARLY' },
    { id: 'thanksgiving', date: '2020-01-01', description: 'Thanksgiving', recurrence: 'FREQ=YEARLY;BYMONTH=11;BYDAY=+4TH' },
    { id: 'christmas', date: '2020-12-24', endDate: '2020-12-26', description: 'Christmas holidays', recurrence: 'FREQ=YEARLY', data: { greeting: 'Merry Christmas!', isOfficeClosed: true } },
    { id: 'newYearsEve', date: '2020-12-31', description: "New Year's Eve", recurrence: 'FREQ=YEARLY' },
    { id: 'offsite', date: '2025-11-12', endDate: '2025-11-14', description: 'Company offsite' },
    { id: 'releaseFreeze', date: '2025-10-01', description: 'Release freeze', recurrence: 'FREQ=MONTHLY;BYDAY=-1FR' },
];
