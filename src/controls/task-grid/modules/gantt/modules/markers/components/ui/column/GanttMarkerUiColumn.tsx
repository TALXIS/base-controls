import { ReactNode, useMemo } from "react";
import { GanttMarkerUiColumnComponents, IGanttMarkerUiColumnComponents } from "./components";
import { getGanttMarkerUiColumnStyles } from "./styles";

export interface IGanttMarkerUiColumnProps {
    /** Where the marker's date is on the timeline, in pixels. */
    left: number;
    /** The track and the scale. */
    children?: ReactNode;
    components?: Partial<IGanttMarkerUiColumnComponents>;
}

/** A zero-width column at a date, down the whole timeline. */
export const GanttMarkerUiColumn = (props: IGanttMarkerUiColumnProps) => {
    const components = { ...GanttMarkerUiColumnComponents, ...props.components };
    const styles = useMemo(() => getGanttMarkerUiColumnStyles(), []);

    return components.onRenderContainer({ className: styles.column, style: { left: props.left }, children: props.children });
};
