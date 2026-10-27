import { ErrorBoundary } from "@utils";
import { useDatasetControlModule } from "@controls/dataset-control";
import { Grid, IGridCellParams, useGridField } from "@controls/grid";
import { ChecklistProgress } from "../../ui";

const ChecklistCellProgress = () => {
    const field = useGridField();
    const checklist = useDatasetControlModule('checklist');
    return <ErrorBoundary error={checklist.getError()}>
        <ChecklistProgress items={field?.getValue() ?? []} />
    </ErrorBoundary>;
};

/** A checklist cell: the task's progress as `done/total`. */
export const ChecklistCell = (props: IGridCellParams) => {
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <ChecklistCellProgress /> } }} />
    </Grid.Cell.Field>;
};
