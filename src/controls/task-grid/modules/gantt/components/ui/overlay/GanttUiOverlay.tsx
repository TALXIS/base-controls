import { useTheme } from "@theme";
import { useMemo } from "react";

import { GanttUiOverlayComponents, IGanttUiOverlayComponents } from "./components";
import { getGanttUiOverlayStyles } from "./styles";

export interface IGanttUiOverlayProps {
    components?: Partial<IGanttUiOverlayComponents>;
}

/** A translucent cover that blocks the chart beneath it. */
export const GanttUiOverlay = (props: IGanttUiOverlayProps) => {
    const components = { ...GanttUiOverlayComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getGanttUiOverlayStyles(theme), [theme]);

    return components.onRenderContainer({ className: styles.root });
};
