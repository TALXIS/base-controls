import { useMemo } from "react";
import { IRecordEvents } from "@talxis/client-libraries";
import { GridCellRenderer } from "@components/GridCellRenderer";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useGridCell } from "../../cell-host/context";
import { LegacyNestedControlRenderer } from "../legacy-nested-control-renderer";
import { ControlComponents, IControlComponents } from "./components";

export interface IControlAdapterProps {
    /** Whether the control takes input rather than only drawing the value. */
    editing?: boolean;
    components?: Partial<IControlComponents>;
}

/**
 * What a cell draws for its value, and what tells it to redraw.
 *
 * Reads the cell it is drawn in, so it has to be inside a `CellHost`. Owns the subscription on this path,
 * because a value AG Grid cannot see change is a value it does not refresh. Which control draws the value
 * is the cell's own `GridControl`'s to decide, and a column of the grid's own draws nothing here.
 */
export const Control = (props: IControlAdapterProps) => {
    const cell = useGridCell();
    const record = cell.getRecord();
    const control = useMemo(() => cell.createControl(props.editing), [cell, props.editing]);
    const components = { ...ControlComponents, ...props.components };
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
