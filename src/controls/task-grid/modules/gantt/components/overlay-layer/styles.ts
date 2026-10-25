import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getGanttOverlayLayerStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        background: `color-mix(in srgb, ${theme.semanticColors.bodyBackground} 66%, transparent)`,
    },
});
