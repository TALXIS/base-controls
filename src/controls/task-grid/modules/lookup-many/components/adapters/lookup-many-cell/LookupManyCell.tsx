import { useMemo } from "react";
import { ErrorBoundary } from "@utils";
import { useDatasetControlModule } from "@controls/dataset-control";
import { Grid, IGridCellParams, useGridCell, useGridField, useGridService } from "@controls/grid";
import { useTaskRuntime } from "../../../../../dataset-control/context";
import { runQuietly } from "../../../../../runtime/runQuietly";
import { LookupManyPills } from "../../ui";
import { getLookupManyAppearanceComponents } from "../lookup-many-appearance";

const LookupManyCellPills = () => {
    const cell = useGridCell();
    const field = useGridField();
    const isNavigationEnabled = useGridService('settings').isNavigationEnabled();
    const runtime = useTaskRuntime();
    const lookupMany = useDatasetControlModule('lookupMany');
    const columnName = cell.getColumnName();
    const appearance = lookupMany.getColumn(columnName)?.appearance;
    const components = useMemo(() => ({ onRenderPill: getLookupManyAppearanceComponents(appearance).onRenderPill, ...lookupMany.components.cell }), [appearance]);

    const onOpen = (reference: ComponentFramework.EntityReference) => runQuietly(() => runtime.tasks.openRelatedRecord(reference, columnName));

    return <ErrorBoundary error={lookupMany.getError()}>
        <LookupManyPills value={field?.getValue() ?? []} onOpen={isNavigationEnabled ? onOpen : undefined} components={components} />
    </ErrorBoundary>;
};

/** A lookup-many cell with its records on one line and the rest in a hoverable `+N`. */
export const LookupManyCell = (props: IGridCellParams) => {
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <LookupManyCellPills /> } }} />
    </Grid.Cell.Field>;
};
