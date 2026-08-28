import { IRawRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { ICheckListDatasetControl, ICheckListDatasetControlEvents } from "./CheckListDatasetControl";

/** Everything the checklist reports. Every one is optional on `ICheckListProps`. */
export interface ICheckListEvents {
    /** An item was added. */
    onItemCreated: (item: IRawRecord) => void;
    /** An item was deleted. */
    onItemDeleted: (itemId: string) => void;
    /** An item was dragged to a new position. */
    onItemMoved: (itemId: string) => void;
    /** An item was ticked or unticked. */
    onItemCompletionChanged: (itemId: string, isCompleted: boolean) => void;
    /** An item was saved — a rename, a tick, a reorder, a new item. */
    onItemSaved: (result: IRecordSaveOperationResult) => void;
    /** The list changed, with every item as it now stands. */
    onDataChanged: (items: IRawRecord[]) => void;
    /** Something failed. The checklist shows its own dialog; this is for logging. */
    onError: (error: any, message: string) => void;
}

/**
 * Forwards every event the checklist raises to the matching prop. Nothing is decided here — whatever
 * raises a change is what raises `onDataChanged` with it.
 */
export const useCheckListEvents = (events: Partial<ICheckListEvents>, datasetControl: ICheckListDatasetControl) => {
    const { events: checkListEvents } = datasetControl;

    useEventEmitter<ICheckListDatasetControlEvents>(checkListEvents, 'onItemCreated', (item: IRawRecord) => events.onItemCreated?.(item));
    useEventEmitter<ICheckListDatasetControlEvents>(checkListEvents, 'onItemDeleted', (itemId: string) => events.onItemDeleted?.(itemId));
    useEventEmitter<ICheckListDatasetControlEvents>(checkListEvents, 'onItemMoved', (itemId: string) => events.onItemMoved?.(itemId));
    useEventEmitter<ICheckListDatasetControlEvents>(checkListEvents, 'onItemCompletionChanged', (itemId: string, isCompleted: boolean) => events.onItemCompletionChanged?.(itemId, isCompleted));
    useEventEmitter<ICheckListDatasetControlEvents>(checkListEvents, 'onItemSaved', (result: IRecordSaveOperationResult) => events.onItemSaved?.(result));
    useEventEmitter<ICheckListDatasetControlEvents>(checkListEvents, 'onDataChanged', (items: IRawRecord[]) => events.onDataChanged?.(items));
    useEventEmitter<ICheckListDatasetControlEvents>(checkListEvents, 'onError', (error: any, message: string) => events.onError?.(error, message));
};
