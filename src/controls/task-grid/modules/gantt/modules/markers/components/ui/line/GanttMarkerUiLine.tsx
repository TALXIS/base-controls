import { useMemo } from "react";
import { GanttMarkerUiLineComponents, IGanttMarkerUiLineComponents } from "./components";
import { getGanttMarkerUiLineStyles } from "./styles";

export interface IGanttMarkerUiLineProps {
    color: string;
    components?: Partial<IGanttMarkerUiLineComponents>;
}

/** A vertical line down the timeline. */
export const GanttMarkerUiLine = (props: IGanttMarkerUiLineProps) => {
    const components = { ...GanttMarkerUiLineComponents, ...props.components };
    const styles = useMemo(() => getGanttMarkerUiLineStyles(), []);

    return components.onRenderContainer({ className: styles.line, style: { backgroundColor: props.color } });
};
