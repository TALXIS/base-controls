import { useMemo } from "react";
import { useOpenErrorDialog } from "@core";
import { ErrorMessageBoundary } from "@ui";
import { useDatasetControlModule } from "../../../../../dataset-control";
import { Grid, IGridCellParams, useGridCell, useGridField, useGridService } from "../../../../../grid";
import { useTaskRuntime } from "../../../../adapters/root/context";
import { runQuietly } from "../../../../runtime/runQuietly";
import { LookupManyPills } from "../../ui";
import { getLookupManyAppearanceComponents } from "../lookup-many-appearance";

const LookupManyCellPills = () => {
    const cell = useGridCell();
    const field = useGridField();
    const isNavigationEnabled = useGridService('settings').isNavigationEnabled();
    const runtime = useTaskRuntime();
    const lookupMany = useDatasetControlModule('lookupMany');
    const openErrorDialog = useOpenErrorDialog();
    const columnName = cell.getColumnName();
    const appearance = lookupMany.getColumn(columnName)?.appearance;
    const components = useMemo(() => ({ onRenderPill: getLookupManyAppearanceComponents(appearance).onRenderPill, ...lookupMany.components.cell }), [appearance]);

    const onOpen = (reference: ComponentFramework.EntityReference) => runQuietly(() => runtime.tasks.openRelatedRecord(reference, columnName));

    return <ErrorMessageBoundary error={lookupMany.getError()} onOpenDetails={openErrorDialog}>
        <LookupManyPills value={field?.getValue() ?? []} onOpen={isNavigationEnabled ? onOpen : undefined} components={components} />
    </ErrorMessageBoundary>;
};

/** A lookup-many cell with its records on one line and the rest in a hoverable `+N`. */
export const LookupManyCell = (props: IGridCellParams) => {
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <LookupManyCellPills /> } }} />
    </Grid.Cell.Field>;
};
