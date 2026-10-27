import { useDatasetControlModule } from "@controls/dataset-control";
import { ErrorBoundary } from "@utils";
import { Grid, IGridCellParams, useGridCell, useGridField } from "@controls/grid";
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
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <DependenciesCellCount /> } }} />
    </Grid.Cell.Field>;
};
