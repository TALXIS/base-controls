/** The strings of the checklist module. */
export interface IChecklistLabels {
    checklist: string;
    loadChecklistFailed: string;
}

/** The English defaults for {@link IChecklistLabels}. */
export const CHECKLIST_LABELS: IChecklistLabels = {
    checklist: 'Checklist',
    loadChecklistFailed: 'The checklists could not be loaded.',
};
