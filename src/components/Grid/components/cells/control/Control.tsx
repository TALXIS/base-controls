import { useMemo } from "react";
import { useGridCell } from "../root/context";
import { useRequiredGridField } from "../field";
import { ControlRenderer } from "../control-renderer/ControlRenderer";
import { GridFieldControlContext } from "./context";
import { FieldControlComponents, IGridFieldControlComponents } from "./components";

export interface IGridFieldControlProps {
    components?: Partial<IGridFieldControlComponents>;
}

/** What a cell draws for its value, and what tells it to redraw. */
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
