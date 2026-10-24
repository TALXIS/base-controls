import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { useDatasetControlModule } from "@controls/dataset-control";
import { ErrorBoundary } from "@utils";
import { Grid, IGridCellParams, useGridCell, useGridField } from "@controls/grid";
import type { IDependenciesEvents } from "../../../Dependencies";
import { PREDECESSORS_COLUMN_NAME } from "../../../constants";
import { DependencyCount } from "../../ui";

const DependenciesCellCount = () => {
    const cell = useGridCell();
    const field = useGridField();
    const dependencies = useDatasetControlModule('dependencies');
    const direction = cell.getColumnName() === PREDECESSORS_COLUMN_NAME ? 'predecessors' : 'successors';
    const count = (field?.getValue() ?? []).length;
    return <ErrorBoundary error={dependencies.getError()}>
        <DependencyCount direction={direction} count={count} />
    </ErrorBoundary>;
};

/** A dependencies cell: how many tasks this one waits on, or how many wait on it. */
export const DependenciesCell = (props: IGridCellParams) => {
    const { rerender } = useRerender();
    const dependencies = useDatasetControlModule('dependencies');
    const taskId = props.data!.getRecordId();

    useEventEmitter<IDependenciesEvents>(dependencies.events, 'onDependenciesChanged', (taskIds: string[]) => {
        if (taskIds.includes(taskId)) {
            rerender();
        }
    });
    useEventEmitter<IDependenciesEvents>(dependencies.events, 'onLoading', rerender);

    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <DependenciesCellCount /> } }} />
    </Grid.Cell.Field>;
};
