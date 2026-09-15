import { useGridFieldControl } from "../field-control/context";
import { LegacyNestedControlRenderer } from "../legacy-nested-control-renderer";
import { ControlRendererComponents, IGridControlRendererComponents } from "./components";

export interface IGridControlRendererProps {
    components?: Partial<IGridControlRendererComponents>;
}

/**
 * What draws a cell's value.
 *
 * Reads the control it is drawn under, so it belongs inside a `Grid.FieldControl`, which is what creates
 * one. Which of the two paths a cell takes is that control's answer rather than this component's.
 */
export const ControlRenderer = (props: IGridControlRendererProps) => {
    const control = useGridFieldControl();
    const components = { ...ControlRendererComponents, ...props.components };
    const controlProps = control.getControlProps();

    //a column that named a control of its own, and a cell taking input, go through the nested-control
    //registry - the only thing that resolves a control by name
    if (control.isCustomRendererEnabled()) {
        return <LegacyNestedControlRenderer controlProps={controlProps} control={control} />;
    }
    return components.onRenderValue(controlProps);
};
