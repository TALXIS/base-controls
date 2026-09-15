import { useMemo } from "react";
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
 * Requires a field: it is drawn for the column of a record, and reads the cell it is drawn in, so it has
 * to be inside a `CellRoot` - which is also what redraws it when the record changes, since a value AG Grid
 * cannot see change is a value it does not refresh.
 *
 * What draws the value is `Grid.ControlRenderer`, which this renders and hands `onRenderValue` on to: a
 * consumer changing what a value looks like overrides that rather than composing the renderer themselves.
 */
export const FieldControl = (props: IGridFieldControlProps) => {
    const cell = useGridCell();
    //a field control without a field is a bug in whoever drew it, not a cell to be drawn empty
    const field = useRequiredGridField();
    const control = useMemo(() => cell.createControl(field), [cell, field]);
    const components = { ...FieldControlComponents, ...props.components };

    return <GridFieldControlContext.Provider value={control}>
        {components.onRenderControl({ control: control, children: <ControlRenderer components={{ onRenderValue: components.onRenderValue }} /> })}
    </GridFieldControlContext.Provider>;
};
