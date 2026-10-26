import { ReactNode, useMemo } from "react";
import { GanttMarkerUiScaleComponents, IGanttMarkerUiScaleComponents } from "./components";
import { getGanttMarkerUiScaleStyles } from "./styles";

export interface IGanttMarkerUiScaleProps {
    scaleHeight: number;
    /** The chip. */
    children?: ReactNode;
    components?: Partial<IGanttMarkerUiScaleComponents>;
}

/** The part of a column on the scale, where the chip sits. */
export const GanttMarkerUiScale = (props: IGanttMarkerUiScaleProps) => {
    const components = { ...GanttMarkerUiScaleComponents, ...props.components };
    const styles = useMemo(() => getGanttMarkerUiScaleStyles(), []);

    return components.onRenderContainer({ className: styles.scale, style: { height: props.scaleHeight }, children: props.children });
};
