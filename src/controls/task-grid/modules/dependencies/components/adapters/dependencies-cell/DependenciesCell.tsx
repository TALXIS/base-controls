import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { Grid, IGridCellParams, useGridCell } from "@controls/grid";
import { useTaskGridContext } from "../../../../../context";
import type { IDependenciesEvents } from "../../../Dependencies";
import { PREDECESSORS_COLUMN_NAME } from "../../../constants";
import { DependencyCount } from "../../ui";

const DependenciesCellCount = () => {
    const cell = useGridCell();
    const { runtime } = useTaskGridContext();
    const { rerender } = useRerender();
    const dependencies = runtime.services.get('datasetControl').modules.get('dependencies');
    const taskId = cell.getRecord().getRecordId();
    const direction = cell.getColumnName() === PREDECESSORS_COLUMN_NAME ? 'predecessors' : 'successors';

    useEventEmitter<IDependenciesEvents>(dependencies.events, 'onDependenciesChanged', (taskIds: string[]) => {
        if (taskIds.includes(taskId)) {
            rerender();
        }
    });

    const count = direction === 'predecessors' ? dependencies.getPredecessors(taskId).length : dependencies.getSuccessors(taskId).length;
    return <DependencyCount direction={direction} count={count} />;
};

/** A dependencies cell: how many tasks this one waits on, or how many wait on it. */
export const DependenciesCell = (props: IGridCellParams) => {
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <DependenciesCellCount /> } }} />
    </Grid.Cell.Field>;
};
