import { ITheme, mergeStyleSets } from "@fluentui/react";
import { GANTT_LAYERS } from "../layers";

export const getGanttUiOverlayStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        position: 'absolute',
        inset: 0,
        zIndex: GANTT_LAYERS.overlay,
        background: `color-mix(in srgb, ${theme.semanticColors.bodyBackground} 66%, transparent)`,
    },
});
