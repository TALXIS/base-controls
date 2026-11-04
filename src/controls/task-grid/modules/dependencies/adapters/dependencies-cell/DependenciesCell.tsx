import { useDatasetControlModule } from "../../../../../dataset-control";
import { useOpenErrorDialog } from "@core";
import { ErrorMessageBoundary } from "@ui";
import { Grid, IGridCellParams, useGridCell, useGridField } from "../../../../../grid";
import { PREDECESSORS_COLUMN_NAME } from "../../constants";
import { DependencyCount } from "../../ui";

const DependenciesCellCount = () => {
    const cell = useGridCell();
    const field = useGridField();
    const dependencies = useDatasetControlModule('dependencies');
    const openErrorDialog = useOpenErrorDialog();
    const direction = cell.getColumnName() === PREDECESSORS_COLUMN_NAME ? 'predecessors' : 'successors';
    const count = (field?.getValue() ?? []).length;
    return <ErrorMessageBoundary error={dependencies.getError()} onOpenDetails={openErrorDialog}>
        <DependencyCount direction={direction} count={count} components={dependencies.components.count} />
    </ErrorMessageBoundary>;
};

/** A dependencies cell counting the tasks this one waits on or that wait on it. */
export const DependenciesCell = (props: IGridCellParams) => {
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <DependenciesCellCount /> } }} />
    </Grid.Cell.Field>;
};
