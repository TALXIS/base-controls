import { ReactNode, useMemo } from "react";
import { MarkerUiScaleComponents, IMarkerUiScaleComponents } from "./components";
import { getMarkerUiScaleStyles } from "./styles";

export interface IMarkerUiScaleProps {
    scaleHeight: number;
    /** The chip. */
    children?: ReactNode;
    components?: Partial<IMarkerUiScaleComponents>;
}

/** The part of a column on the scale, where the chip sits. */
export const MarkerUiScale = (props: IMarkerUiScaleProps) => {
    const components = { ...MarkerUiScaleComponents, ...props.components };
    const styles = useMemo(() => getMarkerUiScaleStyles(), []);

    return components.onRender({ className: styles.scale, style: { height: props.scaleHeight }, children: props.children });
};
