import { useMemo } from "react";
import { IRecordEvents } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useGridCell } from "../root/context";
import { useRequiredGridField } from "../field";
import { ControlRenderer } from "../control-renderer/ControlRenderer";
import { GridFieldControlContext } from "./context";
import { FieldControlComponents, IGridFieldControlComponents } from "./components";

export interface IGridFieldControlProps {
    components?: Partial<IGridFieldControlComponents>;
}

/**
 * What a cell draws for its value, and what tells it to redraw.
 *
 * Requires a field: it is drawn for the column of a record. Reads the cell it is drawn in, so it has to be
 * inside a `CellRoot`, and owns the subscription on this path, because a value AG Grid cannot see change is
 * a value it does not refresh. What it makes is the cell's control, and what draws with it is
 * `Grid.ControlRenderer`, which reads it back out of the context put here.
 */
export const FieldControl = (props: IGridFieldControlProps) => {
    const cell = useGridCell();
    //a field control without a field is a bug in whoever drew it, not a cell to be drawn empty
    const field = useRequiredGridField();
    const record = field.getRecord();
    const control = useMemo(() => cell.createControl(field), [cell, field]);
    const components = { ...FieldControlComponents, ...props.components };
    const rerender = useRerender();

    useEventEmitter<IRecordEvents>(record, 'onFieldValueChanged', () => {
        rerender();
    });

    return <GridFieldControlContext.Provider value={control}>
        {components.onRenderControl({ control: control, children: <ControlRenderer /> })}
    </GridFieldControlContext.Provider>;
};
