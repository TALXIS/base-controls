import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { GanttMarkerUiChipComponents, IGanttMarkerUiChipComponents } from "./components";
import { getGanttMarkerUiChipStyles } from "./styles";

export interface IGanttMarkerUiChipProps {
    text: string;
    /** What the chip says when pointed at, such as the date. */
    title: string;
    color: string;
    components?: Partial<IGanttMarkerUiChipComponents>;
}

/** A marker's label on the scale. */
export const GanttMarkerUiChip = (props: IGanttMarkerUiChipProps) => {
    const components = { ...GanttMarkerUiChipComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getGanttMarkerUiChipStyles(theme, props.color), [theme, props.color]);

    return components.onRenderTooltip({
        hostClassName: styles.host,
        content: props.title,
        children: components.onRenderChip({ className: styles.chip, children: props.text }),
    });
};
