import type { IEntityReference } from "@talxis/client-libraries";
import { ErrorBoundary } from "@utils";
import { useDatasetControlModule } from "@controls/dataset-control";
import { Grid, IGridCellParams, useGridField } from "@controls/grid";
import type { IChecklistItemData } from "../../../Checklist";
import { ChecklistProgress } from "../../ui";

const ChecklistCellProgress = () => {
    const field = useGridField();
    const checklist = useDatasetControlModule('checklist');
    const items: IEntityReference<IChecklistItemData>[] = field?.getValue() ?? [];
    const completedCount = items.filter(item => item.data?.isCompleted).length;
    return <ErrorBoundary error={checklist.getError()}>
        <ChecklistProgress completedCount={completedCount} totalCount={items.length} components={checklist.components.progress} />
    </ErrorBoundary>;
};

/** A checklist cell with the task's progress as `done/total`. */
export const ChecklistCell = (props: IGridCellParams) => {
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <ChecklistCellProgress /> } }} />
    </Grid.Cell.Field>;
};
