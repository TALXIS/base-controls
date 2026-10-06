import { Fragment, useMemo } from "react";
import { GridValueRenderer, IGridValueRenderer } from "@controls/grid/value-renderer";
import { useGridCell } from "../root/context";
import { CellLegacyNestedControl } from "../legacy-nested-control-renderer";
import { GridControlContext } from "./context";
import { CellColumnControlComponents, ICellColumnControlComponents } from "./components";

export interface ICellColumnControlProps {
    components?: Partial<ICellColumnControlComponents>;
}

/** Decides what the cell's column draws for its value, and draws it. */
export const CellColumnControl = (props: ICellColumnControlProps) => {
    const cell = useGridCell();
    const control = useMemo(() => cell.createControl(), [cell]);
    const components = { ...CellColumnControlComponents, ...props.components };
    const controlProps = control.getControlProps();

    const onRenderDefault = (renderProps: IGridValueRenderer) => {
        //a column that named a control of its own
        if (control.isCustomRendererEnabled()) {
            return <CellLegacyNestedControl controlProps={renderProps} control={control} />;
        }
        return <GridValueRenderer {...renderProps} />;
    };

    return <GridControlContext.Provider value={control}>
        {/* keyed: `AutoFocus` only affects a control's first render */}
        <Fragment key={`${cell.isBeingEdited()}`}>{components.onRenderControl(controlProps, onRenderDefault)}</Fragment>
    </GridControlContext.Provider>;
};
