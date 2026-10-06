import { useGridCell } from "../../../../components/cells/root/context";
import { useGridService } from "../../../../useGridService";
import { RowSelectionUi } from "../ui";

/** The checkbox that selects the cell's record. */
export const SelectionCheckbox = () => {
    const cell = useGridCell();
    const selection = useGridService('rowSelection')!;
    const record = cell.getRecord();

    return <RowSelectionUi.Checkbox
        state={selection.getRecordSelectionState(cell.getNode()!)}
        disabled={selection.isRecordSelectionDisabled(record)}
        onToggle={() => selection.toggleRecord(record)}
        components={selection.components.cell?.checkbox} />;
};
