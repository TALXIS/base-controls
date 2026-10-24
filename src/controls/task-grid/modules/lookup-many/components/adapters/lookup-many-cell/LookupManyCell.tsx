import { useMemo } from "react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { ErrorBoundary } from "@utils";
import { useDatasetControlModule } from "@controls/dataset-control";
import { Grid, IGridCellParams, useGridCell, useGridService } from "@controls/grid";
import { useTaskGridContext } from "../../../../../context";
import { runQuietly } from "../../../../../runtime/runQuietly";
import type { ILookupManyEvents } from "../../../LookupMany";
import { LookupManyPills } from "../../ui";
import { getLookupManyComponents } from "../getLookupManyComponents";

const LookupManyCellPills = () => {
    const cell = useGridCell();
    const isNavigationEnabled = useGridService('settings').isNavigationEnabled();
    const { runtime } = useTaskGridContext();
    const lookupMany = useDatasetControlModule('lookupMany');
    const columnName = cell.getColumnName();
    const appearance = lookupMany.getColumn(columnName)?.appearance;
    const { onRenderPill } = useMemo(() => getLookupManyComponents(appearance), [appearance]);

    const onOpen = (reference: ComponentFramework.EntityReference) => runQuietly(() => runtime.tasks.openRelatedRecord(reference, columnName));

    return <ErrorBoundary error={lookupMany.getError()}>
        <LookupManyPills value={lookupMany.getValue(cell.getRecord().getRecordId(), columnName)} onOpen={isNavigationEnabled ? onOpen : undefined} components={{ onRenderPill }} />
    </ErrorBoundary>;
};

/** A lookup-many cell: its records on one line, the rest counted in a hoverable `+N`. */
export const LookupManyCell = (props: IGridCellParams) => {
    const { rerender } = useRerender();
    const lookupMany = useDatasetControlModule('lookupMany');
    const taskId = props.data!.getRecordId();

    useEventEmitter<ILookupManyEvents>(lookupMany.events, 'onValuesChanged', (taskIds: string[]) => {
        if (taskIds.includes(taskId)) {
            rerender();
        }
    });
    useEventEmitter<ILookupManyEvents>(lookupMany.events, 'onLoading', rerender);

    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl: () => <LookupManyCellPills /> } }} />
    </Grid.Cell.Field>;
};
