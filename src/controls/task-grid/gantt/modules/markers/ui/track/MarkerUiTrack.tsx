import { ReactNode, useMemo } from "react";
import { MarkerUiTrackComponents, IMarkerUiTrackComponents } from "./components";
import { getMarkerUiTrackStyles } from "./styles";

export interface IMarkerUiTrackProps {
    scaleHeight: number;
    /** The line. */
    children?: ReactNode;
    components?: Partial<IMarkerUiTrackComponents>;
}

/** The part of a column below the scale, where the line runs. */
export const MarkerUiTrack = (props: IMarkerUiTrackProps) => {
    const components = { ...MarkerUiTrackComponents, ...props.components };
    const styles = useMemo(() => getMarkerUiTrackStyles(), []);

    return components.onRender({ className: styles.track, style: { top: props.scaleHeight }, children: props.children });
};
