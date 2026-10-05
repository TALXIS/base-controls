import { Fragment, useMemo } from "react";
import { GridValueRenderer, IGridValueRenderer } from "@controls/grid/value-renderer";
import { useGridCell } from "../root/context";
import { CellLegacyNestedControl } from "../legacy-nested-control-renderer";
import { GridControlContext } from "./context";
import { CellUi } from "../ui";
import { CellControlComponents, ICellControlComponents } from "./components";

export interface ICellControlProps {
    components?: Partial<ICellControlComponents>;
}

/** What a cell draws for its value, and what tells it to redraw. */
export const CellControl = (props: ICellControlProps) => {
    const cell = useGridCell();
    const control = useMemo(() => cell.createControl(), [cell]);
    const components = { ...CellControlComponents, ...props.components };
    const controlProps = control.getControlProps();

    const onRenderDefault = (renderProps: IGridValueRenderer) => {
        //a column that named a control of its own
        if (control.isCustomRendererEnabled()) {
            return <CellLegacyNestedControl controlProps={renderProps} control={control} />;
        }
        return <GridValueRenderer {...renderProps} />;
    };

    return <GridControlContext.Provider value={control}>
        <CellUi.Control alignment={cell.getAlignment()} components={props.components}>
            {/* keyed: `AutoFocus` only affects a control's first render */}
            <Fragment key={`${cell.isBeingEdited()}`}>{components.onRenderControl(controlProps, onRenderDefault)}</Fragment>
        </CellUi.Control>
    </GridControlContext.Provider>;
};
