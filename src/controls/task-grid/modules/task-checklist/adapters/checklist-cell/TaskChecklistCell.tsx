import type { IEntityReference } from "@talxis/client-libraries";
import { useOpenErrorDialog } from "@pcf";
import { ErrorMessageBoundary } from "@ui";
import { useDatasetControlModule } from "@controls/dataset-control";
import { Grid, IGridCellParams, useGridField } from "@controls/grid";
import type { IChecklistItemData } from "../../Checklist";
import { ChecklistProgress } from "../../ui";

const ChecklistCellProgress = () => {
    const field = useGridField();
    const checklist = useDatasetControlModule('checklist');
    const openErrorDialog = useOpenErrorDialog();
    const items: IEntityReference<IChecklistItemData>[] = field?.getValue() ?? [];
    const completedCount = items.filter(item => item.data?.isCompleted).length;
    return <ErrorMessageBoundary error={checklist.getError()} onOpenDetails={openErrorDialog}>
        <ChecklistProgress completedCount={completedCount} totalCount={items.length} components={checklist.components.progress} />
    </ErrorMessageBoundary>;
};

/** A checklist cell with the task's progress as `done/total`. */
export const ChecklistCell = (props: IGridCellParams) => {
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <ChecklistCellProgress /> } }} />
    </Grid.Cell.Field>;
};
