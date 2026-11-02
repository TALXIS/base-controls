import { ReactNode, useMemo } from "react";
import { GanttMarkerUiLayerComponents, IGanttMarkerUiLayerComponents } from "./components";
import { getGanttMarkerUiLayerStyles } from "./styles";

export interface IGanttMarkerUiLayerProps {
    /** The markers. */
    children?: ReactNode;
    components?: Partial<IGanttMarkerUiLayerComponents>;
}

/** A layer over the timeline, above the bars, that lets the pointer through. */
export const GanttMarkerUiLayer = (props: IGanttMarkerUiLayerProps) => {
    const components = { ...GanttMarkerUiLayerComponents, ...props.components };
    const styles = useMemo(() => getGanttMarkerUiLayerStyles(), []);

    return components.onRenderContainer({ className: styles.layer, children: props.children });
};
