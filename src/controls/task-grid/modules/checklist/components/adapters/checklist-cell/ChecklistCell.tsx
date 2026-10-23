import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { useDatasetControlModule } from "@controls/dataset-control";
import { Grid, IGridCellParams, useGridCell } from "@controls/grid";
import type { IChecklistEvents } from "../../../Checklist";
import { ChecklistProgress } from "../../ui";

const ChecklistCellProgress = () => {
    const cell = useGridCell();
    const { rerender } = useRerender();
    const checklist = useDatasetControlModule('checklist');
    const taskId = cell.getRecord().getRecordId();

    useEventEmitter<IChecklistEvents>(checklist.events, 'onItemsChanged', (taskIds: string[]) => {
        if (taskIds.includes(taskId)) {
            rerender();
        }
    });

    return <ChecklistProgress items={checklist.getItems(taskId)} />;
};

/** A checklist cell: the task's progress as `done/total`. */
export const ChecklistCell = (props: IGridCellParams) => {
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <ChecklistCellProgress /> } }} />
    </Grid.Cell.Field>;
};
