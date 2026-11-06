import { ChecklistRoot } from './Checklist';
import { CompletionCell } from './modules/checklist/adapters/completion-cell';
import { NameCell } from './modules/checklist/adapters/name-cell';
import { ChecklistUi, IChecklistUi } from './modules/checklist/ui';

/** The parts of the checklist, attached to the checklist itself. */
export interface IChecklistParts {
    /** The cell an item is ticked off in. */
    CompletionCell: typeof CompletionCell;
    /** The cell of an item's name, struck through once the item is finished. */
    NameCell: typeof NameCell;
    /** The checklist's parts as plain UI, with no grid behind them. */
    Ui: IChecklistUi;
}

/** A grid over the provider's records as a checklist: tick off, rename, reorder, add and delete items. */
export const Checklist: typeof ChecklistRoot & IChecklistParts = Object.assign(ChecklistRoot, { CompletionCell, NameCell, Ui: ChecklistUi });
