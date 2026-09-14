import { useMemo } from "react";
import { IRecordEvents } from "@talxis/client-libraries";
import { GridCellRenderer } from "@components/GridCellRenderer";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useGridCell } from "../root/context";
import { useRequiredGridField } from "../field";
import { LegacyNestedControlRenderer } from "../legacy-nested-control-renderer";
import { FieldControlComponents, IGridFieldControlComponents } from "./components";

export interface IGridFieldControlProps {
    /** Whether the control takes input rather than only drawing the value. */
    editing?: boolean;
    components?: Partial<IGridFieldControlComponents>;
}

/**
 * What a cell draws for its value, and what tells it to redraw.
 *
 * Requires a field: it is drawn for the column of a record, so a column of the grid's own - the checkboxes,
 * the column a save is reported in - draws nothing here. Reads the cell it is drawn in, so it has to be
 * inside a `CellRoot`, and owns the subscription on this path, because a value AG Grid cannot see change is
 * a value it does not refresh. Which control draws the value is the cell's own `GridFieldControl`'s to
 * decide.
 */
export const FieldControl = (props: IGridFieldControlProps) => {
    const cell = useGridCell();
    //a field control without a field is a bug in whoever drew it, not a cell to be drawn empty
    const field = useRequiredGridField();
    const record = field.getRecord();
    const control = useMemo(() => cell.createControl(field, props.editing), [cell, field, props.editing]);
    const components = { ...FieldControlComponents, ...props.components };
    const rerender = useRerender();

    useEventEmitter<IRecordEvents>(record, 'onFieldValueChanged', () => {
        rerender();
    });

    if (!control) {
        return null;
    }
    const controlProps = control.getControlProps();

    return components.onRenderControl({
        alignment: cell.getColDef().propBag?.alignment,
        children: control.isCustomRendererEnabled()
            ? <LegacyNestedControlRenderer controlProps={controlProps} control={control} />
            : <GridCellRenderer {...controlProps} />,
    });
};
