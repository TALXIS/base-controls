import { Grid, IGridCellParams, useGridCell } from "@controls/grid";
import { useTaskGridContext } from "../../../../../context";
import { ChecklistProgress } from "../../ui";

const ChecklistCellProgress = () => {
    const cell = useGridCell();
    const { runtime } = useTaskGridContext();
    const checklist = runtime.services.get('datasetControl').modules.get('checklist');
    return <ChecklistProgress items={checklist.getItems(cell.getRecord())} />;
};

/** A checklist cell: the task's progress as `done/total`. */
export const ChecklistCell = (props: IGridCellParams) => {
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <ChecklistCellProgress /> } }} />
    </Grid.Cell.Field>;
};
