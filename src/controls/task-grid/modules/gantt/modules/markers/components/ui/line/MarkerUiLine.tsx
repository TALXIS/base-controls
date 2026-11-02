import { useMemo } from "react";
import type { GanttMarkerLineStyle } from "../../../GanttMarkers";
import { GanttMarkerUiLineComponents, IGanttMarkerUiLineComponents } from "./components";
import { getGanttMarkerUiLineStyles } from "./styles";

export interface IGanttMarkerUiLineProps {
    color: string;
    /** Dotted by default. */
    lineStyle?: GanttMarkerLineStyle;
    components?: Partial<IGanttMarkerUiLineComponents>;
}

/** A vertical line down the timeline. */
export const GanttMarkerUiLine = (props: IGanttMarkerUiLineProps) => {
    const components = { ...GanttMarkerUiLineComponents, ...props.components };
    const styles = useMemo(() => getGanttMarkerUiLineStyles(), []);

    const background = props.lineStyle === 'solid' ? props.color : `repeating-linear-gradient(to bottom, ${props.color} 0 6px, transparent 6px 11px)`;
    return components.onRenderContainer({ className: styles.line, style: { background } });
};
