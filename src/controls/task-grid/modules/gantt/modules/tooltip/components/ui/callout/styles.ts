import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTaskTooltipUiCalloutStyles = (theme: ITheme) => mergeStyleSets({
    callout: {
        borderRadius: theme.effects.roundedCorner6,
        boxShadow: theme.effects.elevation16,
    },
    calloutMain: {
        borderRadius: theme.effects.roundedCorner6,
    },
    container: {
        width: 280,
        boxSizing: 'border-box',
        padding: '14px 16px 12px',
        pointerEvents: 'none',
    },
});
