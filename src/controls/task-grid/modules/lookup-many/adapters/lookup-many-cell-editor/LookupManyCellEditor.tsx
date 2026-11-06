import { useEffect, useMemo } from "react";
import { useLabels } from "@labels";
import type { ICellEditorParams } from "ag-grid-community";
import { useDatasetControlModule } from "@controls/dataset-control";
import { EditingCell, Grid, IGridCellParams, useGridCell, useGridField } from "@controls/grid";
import { useTaskRuntime } from "../../../../adapters/root/context";
import { LookupManyUiEditorPopup, LookupManyUiSelect } from "../../ui";
import { getLookupManyAppearanceComponents } from "../lookup-many-appearance";
import { LOOKUP_MANY_LABELS } from "../../labels";

interface ILookupManyCellSelectProps {
    /** The key that opened the editor, the first letter of the search. */
    eventKey: string | null;
    cellWidth: number;
}

const LookupManyCellSelect = (props: ILookupManyCellSelectProps) => {
    const cell = useGridCell();
    const field = useGridField();
    const runtime = useTaskRuntime();
    const lookupMany = useDatasetControlModule('lookupMany');
    const record = cell.getRecord();
    const column = runtime.getProvider().getColumnsMap()[cell.getColumnName()];
    const appearance = lookupMany.getColumn(column.name)?.appearance;
    const components = useMemo(() => ({ ...getLookupManyAppearanceComponents(appearance), ...lookupMany.components.editor }), [appearance]);
    const optionsProvider = useMemo(() => lookupMany.createOptionsProvider(record, column), [record, column]);
    useEffect(() => () => optionsProvider?.destroy(), [optionsProvider]);
    const labels = useLabels(LOOKUP_MANY_LABELS);

    return <LookupManyUiEditorPopup cellWidth={props.cellWidth} components={lookupMany.components.editorPopup}>
        <LookupManyUiSelect
            dataProvider={optionsProvider}
            value={field?.getValue() ?? []}
            disabled={!optionsProvider}
            autoFocus
            defaultSearchQuery={props.eventKey?.length === 1 ? props.eventKey : undefined}
            noRecordsFoundText={labels.get('lookupMany.noRecordsFound')}
            loadingText={labels.get('lookupMany.loading')}
            getRemoveText={reference => labels.get('lookupMany.remove', { name: reference.name ?? '' })}
            components={components}
            onChange={value => field?.setValue(value)} />
    </LookupManyUiEditorPopup>;
};

/** A lookup-many cell being edited in a picker popped out over the cell. */
export const LookupManyCellEditor = (props: IGridCellParams & Pick<ICellEditorParams, 'eventKey'>) => {
    const cellWidth = props.column?.getActualWidth() ?? 0;
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <EditingCell.Editor {...props} components={{ columnControl: { onRenderControl: () => <LookupManyCellSelect eventKey={props.eventKey} cellWidth={cellWidth} /> } }} />
    </Grid.Cell.Field>;
};
