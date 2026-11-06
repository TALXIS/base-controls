import { defineLabels } from "@labels";

/** Every localizable string the checklist renders. */
export const CHECKLIST_LABELS = defineLabels({
    /** Shown in the new-record row while it is empty. */
    'checklist.newItemPlaceholder': 'Add an item...',
    /** Names the completion checkbox, which has no visible header of its own. */
    'checklist.markItemFinished': 'Mark as finished',
    /** Tooltip on an item's delete button. */
    'checklist.deleteItem': 'Delete',
    /** Asked before an item is deleted. */
    'checklist.confirmDialog.deleteItem.text': 'Are you sure you want to delete this item?',
});
