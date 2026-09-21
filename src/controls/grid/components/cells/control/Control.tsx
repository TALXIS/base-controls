import { Fragment, useMemo } from "react";
import { GridValueRenderer, IGridValueRenderer } from "@controls/grid/value-renderer";
import { useGridCell } from "../root/context";
import { useGridField } from "../field";
import { LegacyNestedControlRenderer } from "../legacy-nested-control-renderer";
import { GridControlContext } from "./context";
import { GridControlComponents, IGridControlComponents } from "./components";

export interface IGridControlProps {
    components?: Partial<IGridControlComponents>;
}

/** What a cell draws for its value, and what tells it to redraw. */
export const Control = (props: IGridControlProps) => {
    const cell = useGridCell();
    const field = useGridField();
    const control = useMemo(() => cell.createControl(field), [cell, field]);
    const components = { ...GridControlComponents, ...props.components };
    const controlProps = control.getControlProps();

    const onRenderDefault = (renderProps: IGridValueRenderer) => {
        //a column that named a control of its own
        if (control.isCustomRendererEnabled()) {
            return <LegacyNestedControlRenderer controlProps={renderProps} control={control} />;
        }
        return <GridValueRenderer {...renderProps} />;
    };

    return <GridControlContext.Provider value={control}>
        {components.onRenderControlContainer({
            control: control,
            alignment: cell.getAlignment(),
            //keyed: `AutoFocus` decides a control's first render, so stepping in has to be one
            children: <Fragment key={`${cell.isBeingEdited()}`}>{components.onRenderControl(controlProps, onRenderDefault)}</Fragment>,
        })}
    </GridControlContext.Provider>;
};
