import { useEffect, useMemo, useRef } from "react";
import { useLabels, useResizeEffect } from "@utils";
import { useTheme } from "@fluentui/react";
import type { ICellEditorParams } from "ag-grid-community";
import { useDatasetControlModule } from "@controls/dataset-control";
import { EditingCell, Grid, IGridCellParams, useGridCell, useGridField } from "@controls/grid";
import { useTaskGridContext } from "../../../../../context";
import { LookupManySelect } from "../../ui";
import { getLookupManyComponents } from "../getLookupManyComponents";
import { LOOKUP_MANY_LABELS } from "../../../labels";
import { getLookupManyCellEditorStyles, LOOKUP_MANY_EDITOR_MIN_WIDTH } from "./styles";

interface ILookupManyCellSelectProps {
    /** The key that opened the editor, the first letter of the search. */
    eventKey: string | null;
    cellWidth: number;
}

const LookupManyCellSelect = (props: ILookupManyCellSelectProps) => {
    const cell = useGridCell();
    const field = useGridField();
    const theme = useTheme();
    const { runtime } = useTaskGridContext();
    const lookupMany = useDatasetControlModule('lookupMany');
    const record = cell.getRecord();
    const column = runtime.getProvider().getColumnsMap()[cell.getColumnName()];
    const styles = useMemo(() => getLookupManyCellEditorStyles(theme), [theme]);
    const appearance = lookupMany.getColumn(column.name)?.appearance;
    const components = useMemo(() => getLookupManyComponents(appearance), [appearance]);
    const optionsProvider = useMemo(() => lookupMany.createOptionsProvider(record, column), [record, column]);
    useEffect(() => () => optionsProvider?.destroy(), [optionsProvider]);
    const labels = useLabels(LOOKUP_MANY_LABELS);
    const rootRef = useRef<HTMLDivElement>(null);
    const shiftRef = useRef({ x: 0, y: 0 });

    //AG Grid places the popup before it is drawn, and a cell never takes its content's width
    useResizeEffect(rootRef, () => {
        const popup = rootRef.current?.closest<HTMLElement>('.ag-popup-editor');
        const grid = popup?.closest('.ag-root-wrapper')?.getBoundingClientRect();
        if (!popup || !grid) {
            return;
        }
        popup.style.width = `${Math.max(LOOKUP_MANY_EDITOR_MIN_WIDTH, props.cellWidth)}px`;
        const rect = popup.getBoundingClientRect();
        const shift = shiftRef.current;
        shift.x = Math.min(0, grid.right - (rect.right - shift.x));
        shift.y = Math.min(0, grid.bottom - (rect.bottom - shift.y));
        popup.style.transform = `translate(${shift.x}px, ${shift.y}px)`;
    });

    return <div ref={rootRef} className={styles.root}>
        <LookupManySelect
            dataProvider={optionsProvider}
            value={field?.getValue() ?? []}
            isDisabled={!optionsProvider}
            autoFocus
            defaultSearchQuery={props.eventKey?.length === 1 ? props.eventKey : undefined}
            noRecordsFoundText={labels.get('lookupMany.noRecordsFound')}
            loadingText={labels.get('lookupMany.loading')}
            components={components}
            onChange={value => field?.setValue(value)} />
    </div>;
};

/** A lookup-many cell being edited: a picker popped out over the cell, its records wrapping. */
export const LookupManyCellEditor = (props: IGridCellParams & Pick<ICellEditorParams, 'eventKey'>) => {
    const cellWidth = props.column?.getActualWidth() ?? 0;
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <EditingCell.Editor {...props} components={{ columnControl: { onRenderControl: () => <LookupManyCellSelect eventKey={props.eventKey} cellWidth={cellWidth} /> } }} />
    </Grid.Cell.Field>;
};
