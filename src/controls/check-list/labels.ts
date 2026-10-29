import { defineLabels } from "@utils";

/** Every localizable string the checklist renders. */
export const CHECK_LIST_LABELS = defineLabels({
    /** Shown in the new-record row while it is empty. */
    'checkList.newItemPlaceholder': 'Add an item...',
    /** Names the completion checkbox, which has no visible header of its own. */
    'checkList.markItemFinished': 'Mark as finished',
    /** Tooltip on an item's delete button. */
    'checkList.deleteItem': 'Delete',
    /** Asked before an item is deleted. */
    'checkList.confirmDialog.deleteItem.text': 'Are you sure you want to delete this item?',
});
