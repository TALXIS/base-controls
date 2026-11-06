import { ChecklistUiCompletionCheckbox } from './completion-checkbox';
import { ChecklistUiNameCell } from './name-cell';

export * from './completion-checkbox';
export * from './name-cell';

/** The checklist's parts as plain UI, with no grid behind them. */
export interface IChecklistUi {
    /** The round check an item is ticked off with. */
    CompletionCheckbox: typeof ChecklistUiCompletionCheckbox;
    /** The box an item's name is drawn in, struck through once the item is finished. */
    NameCell: typeof ChecklistUiNameCell;
}

/** Every part of the checklist as plain UI, with no grid behind it. */
export const ChecklistUi: IChecklistUi = {
    CompletionCheckbox: ChecklistUiCompletionCheckbox,
    NameCell: ChecklistUiNameCell,
};
