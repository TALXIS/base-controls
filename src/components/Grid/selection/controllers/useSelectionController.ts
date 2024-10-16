import { useGridInstance } from "../../core/hooks/useGridInstance";
import { IEntityRecord } from "../../interfaces";

interface ISelectionController {
    type: "multiple" | "single" | undefined;
    selectedRecordIds: string[];
    allRecordsSelected: boolean;
    toggle: (record: IEntityRecord, state: boolean) => void;
    clear: () => void;
    selectAll: () => void;
}

export const useSelectionController = (): ISelectionController => {
    const grid = useGridInstance();
    const selection = grid.selection;

    const renderDecorator = async (fn: () => void | Promise<void>) => {
        await fn();
        grid.pcfContext.factory.requestRender();
    };

    return {
        type: selection.type,
        selectedRecordIds: selection.selectedRecordIds,
        allRecordsSelected: selection.allRecordsSelected,
        toggle: (record: IEntityRecord, state: boolean) => renderDecorator(() => selection.toggle(record, state)),
        clear: () => renderDecorator(() => selection.clear()),
        selectAll: () => renderDecorator(() => selection.selectAll()),
    };
};
