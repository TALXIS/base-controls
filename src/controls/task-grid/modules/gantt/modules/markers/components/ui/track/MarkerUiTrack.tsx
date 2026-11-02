import { ReactNode, useMemo } from "react";
import { GanttMarkerUiTrackComponents, IGanttMarkerUiTrackComponents } from "./components";
import { getGanttMarkerUiTrackStyles } from "./styles";

export interface IGanttMarkerUiTrackProps {
    scaleHeight: number;
    /** The line. */
    children?: ReactNode;
    components?: Partial<IGanttMarkerUiTrackComponents>;
}

/** The part of a column below the scale, where the line runs. */
export const GanttMarkerUiTrack = (props: IGanttMarkerUiTrackProps) => {
    const components = { ...GanttMarkerUiTrackComponents, ...props.components };
    const styles = useMemo(() => getGanttMarkerUiTrackStyles(), []);

    return components.onRenderContainer({ className: styles.track, style: { top: props.scaleHeight }, children: props.children });
};
