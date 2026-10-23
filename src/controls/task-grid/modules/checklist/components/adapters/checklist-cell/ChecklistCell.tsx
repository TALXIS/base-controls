import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { ErrorBoundary } from "@utils";
import { useDatasetControlModule } from "@controls/dataset-control";
import { Grid, IGridCellParams, useGridCell } from "@controls/grid";
import type { IChecklistEvents } from "../../../Checklist";
import { ChecklistProgress } from "../../ui";

const ChecklistCellProgress = () => {
    const cell = useGridCell();
    const checklist = useDatasetControlModule('checklist');
    return <ErrorBoundary error={checklist.getError()}>
        <ChecklistProgress items={checklist.getItems(cell.getRecord().getRecordId())} />
    </ErrorBoundary>;
};

/** A checklist cell: the task's progress as `done/total`. */
export const ChecklistCell = (props: IGridCellParams) => {
    const { rerender } = useRerender();
    const checklist = useDatasetControlModule('checklist');
    const taskId = props.data!.getRecordId();

    useEventEmitter<IChecklistEvents>(checklist.events, 'onItemsChanged', (taskIds: string[]) => {
        if (taskIds.includes(taskId)) {
            rerender();
        }
    });
    useEventEmitter<IChecklistEvents>(checklist.events, 'onLoading', rerender);

    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <ChecklistCellProgress /> } }} />
    </Grid.Cell.Field>;
};
