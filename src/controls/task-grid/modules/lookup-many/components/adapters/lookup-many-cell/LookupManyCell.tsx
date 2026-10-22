import { useMemo } from "react";
import { Grid, IGridCellParams, useGridCell, useGridField, useGridService } from "@controls/grid";
import { useTaskGridContext } from "../../../../../context";
import { useTaskGridService } from "../../../../../useTaskGrid";
import { LookupManyPills } from "../../ui";
import { getLookupManyComponents } from "../getLookupManyComponents";

const LookupManyCellPills = () => {
    const cell = useGridCell();
    const field = useGridField();
    const provider = useTaskGridService('provider');
    const isNavigationEnabled = useGridService('settings').isNavigationEnabled();
    const { runtime } = useTaskGridContext();
    const columnName = cell.getColumnName();
    const appearance = runtime.services.get('datasetControl').modules.get('lookupMany').getColumn(columnName)?.appearance;
    const { onRenderPill } = useMemo(() => getLookupManyComponents(appearance), [appearance]);

    const onOpen = (reference: ComponentFramework.EntityReference) => provider.openDatasetItem(reference, { columnName });

    return <LookupManyPills value={field?.getValue() ?? []} onOpen={isNavigationEnabled ? onOpen : undefined} components={{ onRenderPill }} />;
};

/** A lookup-many cell: its records on one line, the rest counted in a hoverable `+N`. */
export const LookupManyCell = (props: IGridCellParams) => {
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <LookupManyCellPills /> } }} />
    </Grid.Cell.Field>;
};
