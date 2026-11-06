import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTooltipUiCalloutStyles = (theme: ITheme) => mergeStyleSets({
    callout: {
        borderRadius: theme.effects.roundedCorner6,
        boxShadow: theme.effects.elevation16,
    },
    calloutMain: {
        borderRadius: theme.effects.roundedCorner6,
    },
    container: {
        pointerEvents: 'none',
    },
});
