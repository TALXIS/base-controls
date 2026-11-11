import type { IEntityReference } from "@talxis/client-libraries";
import { useOpenErrorDialog } from "@pcf";
import { ErrorMessageBoundary } from "@ui";
import { useDatasetControlModule } from "@controls/dataset-control";
import { Grid, IGridCellParams, useGridField } from "@controls/grid";
import type { ITaskChecklistItemData } from "../../TaskChecklist";
import { TaskChecklistUiProgress } from "../../ui";

const TaskChecklistCellProgress = () => {
    const field = useGridField();
    const checklist = useDatasetControlModule('taskChecklist');
    const openErrorDialog = useOpenErrorDialog();
    const items: IEntityReference<ITaskChecklistItemData>[] = field?.getValue() ?? [];
    const completedCount = items.filter(item => item.data?.isCompleted).length;
    return <ErrorMessageBoundary error={checklist.getError()} onOpenDetails={openErrorDialog}>
        <TaskChecklistUiProgress completedCount={completedCount} totalCount={items.length} components={checklist.components.progress} />
    </ErrorMessageBoundary>;
};

/** A checklist cell with the task's progress as `done/total`. */
export const TaskChecklistCell = (props: IGridCellParams) => {
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRender: () => <TaskChecklistCellProgress /> } }} />
    </Grid.Cell.Field>;
};
