import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getCardTitleStyles = (theme: ITheme, nowrap: boolean) => mergeStyleSets({
    cardTitle: {
        fontSize: theme.fonts.medium.fontSize,
        fontFamily: theme.fonts.medium.fontFamily,
        fontWeight: 600,
        lineHeight: '20px',
        color: theme.semanticColors.bodyText,
        minWidth: 0,
        overflowWrap: 'anywhere',
        ...(nowrap ? { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : {}),
    },
});
