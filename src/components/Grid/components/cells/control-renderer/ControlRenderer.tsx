import { useGridCell } from "../root/context";
import { useGridFieldControl } from "../field-control/context";
import { LegacyNestedControlRenderer } from "../legacy-nested-control-renderer";
import { ControlRendererComponents, IGridControlRendererComponents } from "./components";

export interface IGridControlRendererProps {
    components?: Partial<IGridControlRendererComponents>;
}

/** What draws a cell's value. */
export const ControlRenderer = (props: IGridControlRendererProps) => {
    const cell = useGridCell();
    const control = useGridFieldControl();
    const components = { ...ControlRendererComponents, ...props.components };
    const controlProps = control.getControlProps();

    //a column that named a control of its own
    if (control.isCustomRendererEnabled()) {
        //keyed: `AutoFocus` decides a control's first render
        return <LegacyNestedControlRenderer
            key={`${cell.isBeingEdited()}`}
            controlProps={controlProps}
            control={control} />;
    }
    return components.onRenderValue(controlProps);
};
