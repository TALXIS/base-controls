/** Every localizable string the checklist renders. Override any subset through `ICheckListProps.labels`. */
export interface ICheckListLabels {
    /** Shown in the new-record row while it is empty. */
    newItemPlaceholder: string;
    /** Tooltip on an item's delete button. */
    deleteItem: string;
    /** Asked before an item is deleted. */
    'confirmDialog.deleteItem.text': string;
    /** Shown when the provider refused to delete an item. */
    deletingItemError: string;
}

export const CHECK_LIST_LABELS: ICheckListLabels = {
    newItemPlaceholder: 'Add an item...',
    deleteItem: 'Delete',
    'confirmDialog.deleteItem.text': 'Are you sure you want to delete this item?',
    deletingItemError: 'The item could not be deleted.'
};
