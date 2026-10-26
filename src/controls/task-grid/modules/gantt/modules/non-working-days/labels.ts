export interface IGanttNonWorkingDaysLabels {
    hideNonWorkingDays: string;
    weekend: string;
    loadNonWorkingDaysFailed: string;
}

export const GANTT_NON_WORKING_DAYS_LABELS: IGanttNonWorkingDaysLabels = {
    hideNonWorkingDays: 'Hide non-working days',
    weekend: 'Weekend',
    loadNonWorkingDaysFailed: 'The non-working days could not be loaded.',
};
