import { ReactNode, useMemo } from "react";
import { MarkerUiLayerComponents, IMarkerUiLayerComponents } from "./components";
import { getMarkerUiLayerStyles } from "./styles";

export interface IMarkerUiLayerProps {
    /** The markers. */
    children?: ReactNode;
    components?: Partial<IMarkerUiLayerComponents>;
}

/** A layer over the timeline, above the bars, that lets the pointer through. */
export const MarkerUiLayer = (props: IMarkerUiLayerProps) => {
    const components = { ...MarkerUiLayerComponents, ...props.components };
    const styles = useMemo(() => getMarkerUiLayerStyles(), []);

    return components.onRender({ className: styles.layer, children: props.children });
};
