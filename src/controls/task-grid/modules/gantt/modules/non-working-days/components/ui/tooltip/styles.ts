import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getNonWorkingDayTooltipStyles = (theme: ITheme) => mergeStyleSets({
    callout: {
        borderRadius: theme.effects.roundedCorner4,
        boxShadow: theme.effects.elevation8,
    },
    calloutMain: {
        borderRadius: theme.effects.roundedCorner4,
    },
    container: {
        maxWidth: 260,
        padding: '6px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        fontSize: theme.fonts.small.fontSize,
        lineHeight: '16px',
        color: theme.semanticColors.bodyText,
        pointerEvents: 'none',
    },
});
