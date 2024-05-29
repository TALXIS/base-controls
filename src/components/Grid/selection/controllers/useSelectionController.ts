import { useGridInstance } from "../../core/hooks/useGridInstance";
import { IEntityRecord } from "../../interfaces";

interface ISelectionController {
    type: "multiple" | "single" | undefined;
    selectedRecordIds: string[],
    allRecordsSelected: boolean;
    toggle: (record: IEntityRecord, state: boolean) => void;
    clear: () => void,
    selectAll: () => void
}

export const useSelectionController = (): ISelectionController => {
    const grid = useGridInstance();
    const selection = grid.selection;

    return {
        type: selection.type,
        selectedRecordIds: selection.selectedRecordIds,
        allRecordsSelected: selection.allRecordsSelected,
        toggle: (record: IEntityRecord, state: boolean) => selection.toggle(record, state),
        clear: () => selection.clear(),
        selectAll: () => selection.selectAll()
    }
}